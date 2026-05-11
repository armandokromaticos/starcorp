/**
 * Molecule: MlInvoiceRow
 *
 * Fila de factura para "Gestión carteras vencidas".
 * Layout 2x2 con: Fecha / Vencimiento (días overdue), Factura / Nota,
 * y monto a la derecha.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtDivider } from '@/src/components/atoms/at-divider';

function formatMoney(value: number): string {
  return `$${value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

interface MlInvoiceRowProps {
  date: string;
  daysOverdue: number;
  invoiceNumber: string;
  note?: string;
  amount: number;
  showDivider?: boolean;
}

export const MlInvoiceRow = memo<MlInvoiceRowProps>(
  ({ date, daysOverdue, invoiceNumber, note, amount, showDivider = true }) => {
    const overdue = daysOverdue < 0;
    return (
      <View>
        <View className="flex-row items-center px-4 py-3 gap-3">
          <View className="flex-1 gap-2">
            <View className="flex-row gap-6">
              <View className="flex-1 gap-0.5">
                <AtTypography variant="caption" color="#8892A4">
                  Fecha
                </AtTypography>
                <AtTypography variant="body">{formatDate(date)}</AtTypography>
              </View>
              <View className="flex-1 gap-0.5">
                <AtTypography variant="caption" color="#8892A4">
                  Vencimiento
                </AtTypography>
                <AtTypography
                  variant="bodyBold"
                  color={overdue ? '#DC2626' : '#1A1F36'}
                >
                  {daysOverdue} días
                </AtTypography>
              </View>
            </View>
            <View className="flex-row gap-6">
              <View className="flex-1 gap-0.5">
                <AtTypography variant="caption" color="#8892A4">
                  Factura
                </AtTypography>
                <AtTypography variant="body">{invoiceNumber}</AtTypography>
              </View>
              <View className="flex-1 gap-0.5">
                <AtTypography variant="caption" color="#8892A4">
                  Nota
                </AtTypography>
                <AtTypography variant="body" numberOfLines={2}>
                  {note ?? '—'}
                </AtTypography>
              </View>
            </View>
          </View>
          <AtTypography variant="bodyBold">{formatMoney(amount)}</AtTypography>
        </View>
        {showDivider && <AtDivider className="mx-4" />}
      </View>
    );
  },
);

MlInvoiceRow.displayName = 'MlInvoiceRow';
