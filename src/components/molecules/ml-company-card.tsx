/**
 * Molecule: MlCompanyCard
 *
 * Dark navy card used inside the Financiero carousel on the dashboard:
 * logo square + company name + dark delta chip, followed by
 * "Ingresos totales" label and the amount.
 */

import { AtDeltaIndicator } from "@/src/components/atoms/at-delta-indicator";
import { AtIcon } from "@/src/components/atoms/at-icon";
import { AtTypography } from "@/src/components/atoms/at-typography";
import { Pressable, View } from "@/src/tw";
import { formatCurrency } from "@/src/utils/currency";
import React, { memo } from "react";

interface MlCompanyCardProps {
  name: string;
  totalLabel: string;
  totalValue: number;
  deltaPercent?: number;
  onPress?: () => void;
  className?: string;
  width?: number;
}

export const MlCompanyCard = memo<MlCompanyCardProps>(
  ({
    name,
    totalLabel,
    totalValue,
    deltaPercent,
    onPress,
    className,
    width = 280,
  }) => {
    return (
      <Pressable
        onPress={onPress}
        className={`bg-navy rounded-lg p-4 gap-3 ${className ?? ""}`}
        style={{ width, borderCurve: "continuous" }}
      >
        <View className="flex-row items-center gap-3">
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              borderCurve: "continuous",
            }}
          >
            <AtIcon name="business" size="md" color="#1A2B6D" />
          </View>

          <AtTypography
            variant="h3"
            color="#FFFFFF"
            numberOfLines={1}
            className="flex-1"
          >
            {name}
          </AtTypography>

          {deltaPercent != null && (
            <AtDeltaIndicator
              value={deltaPercent}
              size="sm"
              appearance="dark"
            />
          )}
        </View>

        <View className="gap-1">
          <AtTypography variant="bodyBold" color="#FFFFFF">
            {totalLabel}
          </AtTypography>
          <AtTypography
            variant="metricSmall"
            color="#FFFFFF"
            selectable
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {formatCurrency(totalValue, { currency: "USD", compact: false })}
          </AtTypography>
        </View>
      </Pressable>
    );
  },
);

MlCompanyCard.displayName = "MlCompanyCard";
