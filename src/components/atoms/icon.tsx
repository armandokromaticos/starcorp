/**
 * Atom: Icon
 *
 * Wrapper around Octicons for consistent icon usage.
 */

import React, { ComponentProps } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Octicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Octicons>['name'];

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 24, color = 'black', style }: IconProps) {
  return <Octicons name={name} size={size} color={color} style={style} />;
}