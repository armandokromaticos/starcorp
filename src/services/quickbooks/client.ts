import { getAccessToken } from '@/src/config/supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export class QBNotConnectedError extends Error {
  constructor() {
    super('not_connected');
    this.name = 'QBNotConnectedError';
  }
}

export class QBReauthRequiredError extends Error {
  constructor() {
    super('reauth_required');
    this.name = 'QBReauthRequiredError';
  }
}

export async function qbQuery<T>(
  endpoint: string,
  query?: Record<string, string>,
): Promise<T> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/qb-query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint, query }),
  });

  if (res.status === 409) throw new QBNotConnectedError();
  if (res.status === 410) throw new QBReauthRequiredError();
  if (!res.ok) {
    throw new Error(`qb-query ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export async function disconnectQuickBooks(): Promise<void> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/qb-disconnect`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
    },
  });
  if (!res.ok) {
    throw new Error(`qb-disconnect ${res.status}: ${await res.text()}`);
  }
}
