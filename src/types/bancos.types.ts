/**
 * Tipos del Informe Bancos.
 *
 * Una empresa = un Realm/Company de QuickBooks. Cada empresa agrupa
 * cuentas tipo Bank con saldo en USD. `balance` puede ser null cuando
 * la empresa aún no tiene cuentas conectadas a QB.
 */

export interface BancoCuenta {
  id: string;
  name: string;
  /** Código corto mostrado bajo el nombre (ej. "CK 0932"). */
  code: string;
  /** Color sólido del dot en la lista (primer color del degradado). */
  color: string;
  /** Degradado completo de la barra (primer color arriba → último abajo). */
  gradient?: readonly string[];
  /** Saldo en USD. */
  balance: number;
}

export interface BancoEmpresa {
  id: string;
  name: string;
  /** Saldo agregado de las cuentas; null si la empresa no tiene cuentas conectadas. */
  balance: number | null;
  /** Variación porcentual vs periodo anterior. */
  deltaPct: number;
  /**
   * ISO datetime de la última actualización de las cuentas en QB
   * (máx. MetaData.LastUpdatedTime). null si no hay cuentas conectadas.
   */
  lastUpdatedAt: string | null;
  cuentas: BancoCuenta[];
}

export interface BancosSnapshot {
  /** Suma de todas las balances no-null de todas las empresas. */
  totalizado: number;
  /** Delta del totalizado. */
  deltaPct: number;
  /** Fecha de corte (ISO yyyy-mm-dd). */
  updatedAt: string;
  empresas: BancoEmpresa[];
}
