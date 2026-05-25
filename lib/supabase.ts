import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const createFallbackClient = () => {
  const safeResult = { data: null, error: null };
  const fallbackQuery = new Proxy(
    {
      then: (resolve: any) => resolve(safeResult),
    },
    {
      get: () => fallbackQuery,
    },
  ) as any;

  const fallbackChannel = {
    on: () => fallbackChannel,
    subscribe: async () => ({ data: null, error: null }),
  } as const;

  return new Proxy(
    {
      from: () => fallbackQuery,
      channel: () => fallbackChannel,
      removeChannel: () => {},
      auth: {
        signInWithPassword: async () => ({ data: null, error: null }),
        signInWithOAuth: async () => ({ data: null, error: null }),
        getSession: async () => ({ data: null, error: null }),
        signOut: async () => ({ data: null, error: null }),
      },
    },
    {
      get(target, prop) {
        if (prop in target) return (target as any)[prop];
        return () => fallbackQuery;
      },
    },
  ) as any;
};

const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    return createFallbackClient();
  }

  if (typeof window === 'undefined') {
    return createSupabaseJsClient(supabaseUrl, supabaseKey);
  }

  const globalWindow = window as unknown as {
    __PUBG_SUPABASE_CLIENT__?: ReturnType<typeof createBrowserClient>;
  };

  if (!globalWindow.__PUBG_SUPABASE_CLIENT__) {
    globalWindow.__PUBG_SUPABASE_CLIENT__ = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return globalWindow.__PUBG_SUPABASE_CLIENT__;
};

export const supabase = createSupabaseClient();
