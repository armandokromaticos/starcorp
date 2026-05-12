import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQbStatus } from "@/src/hooks/queries/use-companies";
import { startQuickBooksOAuth } from "@/src/services/quickbooks/oauth";
import {
  disconnectQuickBooks,
  type QBConnectedCompany,
} from "@/src/services/quickbooks/client";

export default function ConnectScreen() {
  const router = useRouter();
  const status = useQbStatus();
  const [busy, setBusy] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Members waiting for the admin to connect: poll every 10s so the screen
  // self-advances once the admin completes OAuth on their device.
  const isWaiting =
    !!status.data && status.data.hasAdmin && !status.data.isAdmin;
  useEffect(() => {
    if (!isWaiting) return;
    const id = setInterval(() => {
      status.refetch();
    }, 10_000);
    return () => clearInterval(id);
  }, [isWaiting, status]);

  async function handleConnect() {
    setBusy(true);
    setError(null);
    try {
      const result = await startQuickBooksOAuth();
      if (result.type !== "success") {
        setError("Conexión cancelada.");
        return;
      }
      const refreshed = await status.refetch();
      if (refreshed.data && refreshed.data.companies.length > 0) {
        router.replace("/");
        return;
      }
      setError("No se detectaron compañías conectadas. Intenta de nuevo.");
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("not_admin") || msg.includes("403")) {
        setError("Otro usuario ya está registrado como admin.");
        await status.refetch();
        return;
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function confirmDisconnect(company: QBConnectedCompany) {
    Alert.alert(
      "Desconectar empresa",
      `¿Seguro que querés desconectar "${company.name ?? company.realmId}"? Tu equipo dejará de ver sus datos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desconectar",
          style: "destructive",
          onPress: () => handleDisconnect(company.realmId),
        },
      ],
    );
  }

  async function handleDisconnect(realmId?: string) {
    setDisconnecting(realmId ?? "all");
    setError(null);
    try {
      await disconnectQuickBooks(realmId);
      await status.refetch();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDisconnecting(null);
    }
  }

  if (status.isPending) {
    return (
      <View style={styles.centerFill}>
        <ActivityIndicator color="#20307E" />
      </View>
    );
  }

  const hasAdmin = status.data?.hasAdmin ?? false;
  const isAdmin = status.data?.isAdmin ?? false;
  const companies = status.data?.companies ?? [];

  // Member with data available → bounce into the dashboard.
  // Admin stays on /connect to manage connections.
  if (!isAdmin && companies.length > 0) {
    return <Redirect href="/" />;
  }

  let title: string;
  let subtitle: string;
  let canConnect: boolean;
  let ctaLabel: string;

  if (!hasAdmin) {
    title = "Conecta tu QuickBooks";
    subtitle =
      "Sé el primero en conectar. Como administrador, conectarás QuickBooks para que tu equipo pueda ver los datos.";
    canConnect = true;
    ctaLabel = "Conectar QuickBooks";
  } else if (isAdmin) {
    title = "Conexiones activas";
    subtitle =
      "Eres el administrador. Podés vincular más compañías o desconectar las que ya no necesitás.";
    canConnect = true;
    ctaLabel = "Conectar otra empresa";
  } else {
    title = "Esperando al administrador";
    subtitle =
      "Tu administrador todavía no conecta QuickBooks. Vuelve a intentarlo en unos minutos.";
    canConnect = false;
    ctaLabel = "Volver a verificar";
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroBlock}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {isAdmin && companies.length > 0 ? (
          <View style={styles.companiesBlock}>
            <Text style={styles.sectionLabel}>Empresas vinculadas</Text>
            {companies.map((c) => (
              <View key={c.realmId} style={styles.companyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.companyName}>
                    {c.name ?? `Empresa ${c.realmId.slice(-4)}`}
                  </Text>
                  <Text style={styles.companyMeta}>
                    realm {c.realmId}
                    {c.reauthRequired ? " · requiere reconexión" : ""}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.disconnectBtn}
                  disabled={disconnecting !== null}
                  onPress={() => confirmDisconnect(c)}
                >
                  {disconnecting === c.realmId ? (
                    <ActivityIndicator color="#B91C1C" />
                  ) : (
                    <Text style={styles.disconnectTxt}>Desconectar</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.actionBlock}>
          <TouchableOpacity
            style={[styles.cta, busy && styles.ctaDisabled]}
            disabled={busy}
            onPress={canConnect ? handleConnect : () => status.refetch()}
          >
            <LinearGradient
              colors={["#1938A5", "#04113F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.ctaGradient}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaText}>{ctaLabel}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F8FA" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F8FA",
  },
  heroBlock: { alignItems: "center", marginTop: 32 },
  logo: { width: 96, height: 96, marginBottom: 24 },
  title: {
    fontFamily: "Roboto_700Bold",
    fontSize: 26,
    color: "#20307E",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Roboto_400Regular",
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  companiesBlock: { marginTop: 32 },
  sectionLabel: {
    fontFamily: "Roboto_500Medium",
    fontSize: 13,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  companyName: {
    fontFamily: "Roboto_500Medium",
    fontSize: 15,
    color: "#1F2937",
  },
  companyMeta: {
    fontFamily: "Roboto_400Regular",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  disconnectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  disconnectTxt: {
    color: "#B91C1C",
    fontFamily: "Roboto_500Medium",
    fontSize: 13,
  },
  actionBlock: { marginTop: 32 },
  cta: {
    borderRadius: 8,
    overflow: "hidden",
  },
  ctaGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: {
    color: "#fff",
    fontFamily: "Roboto_700Bold",
    fontSize: 16,
  },
  error: {
    marginTop: 16,
    color: "#B91C1C",
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
});
