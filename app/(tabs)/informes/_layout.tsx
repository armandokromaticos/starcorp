import { Stack } from 'expo-router';
import React from 'react';

// El grid de Informes queda siempre debajo de cualquier informe. Sin esto,
// entrar a un informe desde otra pestaña (Consolidado, detalle de cliente)
// crea el stack de Informes con ese informe como raíz: el "atrás" sale de
// la pestaña pero el informe se queda ahí, y el siguiente informe se apila
// encima — al volver aparecía el primero. Los push cross-tab deben ir con
// `withAnchor: true` para que este anchor se cargue.
export const unstable_settings = {
  anchor: 'index',
};

export default function InformesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
