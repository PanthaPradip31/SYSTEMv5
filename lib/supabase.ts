import { createClient } from '@supabase/supabase-js';

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

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : createFallbackClient();
