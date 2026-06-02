/**
 * Organism: OrPagosDayDetailSheet
 *
 * Bottom sheet azul con la card del día seleccionado: fecha completa,
 * monto total del día y el chip de bucket. Diseñado para superponerse
 * al calendario sin overlay (overlay translúcido pero el calendario
 * sigue visible arriba).
 */

import React, { memo, useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { Pressable, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { formatCurrency } from '@/src/utils/currency';
import {
  formatFullDate,
  MONTO_BUCKET_COLOR,
  MONTO_BUCKET_LABEL,
  type MontoBucket,
} from '@/src/types/pagos.types';

const ENTER = 240;
const EXIT = 220;

interface OrPagosDayDetailSheetProps {
  visible: boolean;
  fechaIso: string | null;
  total: number;
  bucket: MontoBucket | null;
  onClose: () => void;
}

function formatTotal(value: number): string {
  const base = formatCurrency(value);
  const decimals = value.toFixed(2).split('.')[1];
  return `${base},${decimals}`;
}

export const OrPagosDayDetailSheet = memo<OrPagosDayDetailSheetProps>(
  ({ visible, fechaIso, total, bucket, onClose }) => {
    const insets = useSafeAreaInsets();
    const [mounted, setMounted] = useState(visible);

    useEffect(() => {
      if (visible) {
        setMounted(true);
        return;
      }
      const timer = setTimeout(() => setMounted(false), EXIT + 50);
      return () => clearTimeout(timer);
    }, [visible]);

    if (!mounted || !fechaIso) return null;

    const tone = bucket ? MONTO_BUCKET_COLOR[bucket] : null;

    return (
      <Modal
        visible={mounted}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, pointerEvents: visible ? 'auto' : 'none' }}>
          {visible && (
            <Animated.View
              key="overlay"
              entering={FadeIn.duration(ENTER)}
              exiting={FadeOut.duration(EXIT)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.35)',
              }}
            >
              <Pressable onPress={onClose} style={{ flex: 1 }} />
            </Animated.View>
          )}

          {visible && (
            <Animated.View
              key="panel"
              entering={SlideInDown.duration(ENTER)}
              exiting={SlideOutDown.duration(EXIT)}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#1A3FE8',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: insets.bottom + 16,
                paddingHorizontal: 16,
                paddingTop: 8,
              }}
            >
              <View className="items-center pb-2">
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#FFFFFF66',
                  }}
                />
              </View>

              <View className="flex-row items-center justify-between pb-3">
                <AtTypography variant="bodyBold" color="#FFFFFF">
                  Detalle del día
                </AtTypography>
                <Pressable onPress={onClose} hitSlop={8}>
                  <AtIcon name="close" size="md" color="#FFFFFF" />
                </Pressable>
              </View>

              <View
                className="bg-white rounded-lg p-4 gap-2"
                style={{
                  borderCurve: 'continuous',
                }}
              >
                <AtTypography variant="bodyBold" color="#1A1F36">
                  {formatFullDate(fechaIso)}
                </AtTypography>
                <AtTypography
                  variant="h2"
                  color="#1A1F36"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {formatTotal(total)}
                </AtTypography>
                {bucket && tone && (
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: tone.dot,
                      }}
                    />
                    <AtTypography variant="caption" color="#4A5568">
                      {MONTO_BUCKET_LABEL[bucket]}
                    </AtTypography>
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    );
  },
);

OrPagosDayDetailSheet.displayName = 'OrPagosDayDetailSheet';
