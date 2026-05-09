import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQbStatus } from "@/src/hooks/queries/use-companies";
import { startQuickBooksOAuth } from "@/src/services/quickbooks/oauth";

export default function ConnectScreen() {
  const router = useRouter();
  const status = useQbStatus();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (status.isPending) {
    return (
      <View style={styles.centerFill}>
        <ActivityIndicator color="#20307E" />
      </View>
    );
  }

  const hasAdmin = status.data?.hasAdmin ?? false;
  const isAdmin = status.data?.isAdmin ?? false;

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
    title = "Conecta otra empresa";
    subtitle =
      "Eres el administrador. Vincula otra compañía de QuickBooks para que el equipo la vea.";
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
      <View style={styles.container}>
        <View style={styles.heroBlock}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.actionBlock}>
          <TouchableOpacity
            style={[styles.cta, busy && styles.ctaDisabled]}
            disabled={busy}
            onPress={canConnect ? handleConnect : () => status.refetch()}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>{ctaLabel}</Text>
            )}
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F8FA" },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F8FA",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "space-between",
  },
  heroBlock: { alignItems: "center", marginTop: 64 },
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
  actionBlock: { marginBottom: 16 },
  cta: {
    backgroundColor: "#E8952E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
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
