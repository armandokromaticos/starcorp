/**
 * Molecule: MlLabeledInput
 *
 * Campo de formulario del Repositorio: label (con asterisco si es
 * requerido) + TextInput en card blanca con borde suave.
 */

import React, { memo } from 'react';
import { TextInput, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';

interface MlLabeledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const MlLabeledInput = memo<MlLabeledInputProps>(
  ({ label, value, onChangeText, placeholder, required }) => {
    return (
      <View className="gap-2">
        <AtTypography variant="captionBold" color="#1A1F36">
          {label}
          {required ? <AtTypography variant="captionBold" color="#E53E3E"> *</AtTypography> : null}
        </AtTypography>
        <View
          className="bg-bg-card px-4"
          style={{
            borderRadius: 10,
            borderCurve: 'continuous',
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.12)',
          }}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#8892A4"
            className="p-0"
            style={{ fontFamily: 'Roboto_400Regular', fontSize: 14, color: '#1A1F36' }}
          />
        </View>
      </View>
    );
  },
);

MlLabeledInput.displayName = 'MlLabeledInput';
