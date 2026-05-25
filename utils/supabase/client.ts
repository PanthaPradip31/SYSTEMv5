import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const createFallbackClient = () => {
  const error = new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
  );

  return {
    auth: {
      signInWithPassword: async () => ({ data: null, error }),
      signInWithOAuth: async () => ({ data: null, error }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ data: null, error }),
    },
    from: () => ({
      select: async () => ({ data: null, error }),
      insert: async () => ({ data: null, error }),
      upsert: async () => ({ data: null, error }),
      delete: async () => ({ data: null, error }),
      update: async () => ({ data: null, error }),
      maybeSingle: async () => ({ data: null, error }),
    }),
    channel: () => ({
      on: () => ({
        on: () => ({ subscribe: async () => ({ data: null, error: null }) }),
        subscribe: async () => ({ data: null, error: null }),
      }),
      subscribe: async () => ({ data: null, error: null }),
    }),
    removeChannel: () => {},
  } as any;
};

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    return createFallbackClient();
  }

  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseKey);
  }

  const globalWindow = window as unknown as Record<string, unknown> & {
    __PUBG_SUPABASE_CLIENT__?: ReturnType<typeof createBrowserClient>
  };

  if (!globalWindow.__PUBG_SUPABASE_CLIENT__) {
    globalWindow.__PUBG_SUPABASE_CLIENT__ = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return globalWindow.__PUBG_SUPABASE_CLIENT__;
};
