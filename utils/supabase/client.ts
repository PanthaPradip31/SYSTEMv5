import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

declare global {
    // allow attaching to globalThis for HMR/singleton across module reloads
    interface Window { __SUPABASE_CLIENT__?: ReturnType<typeof createBrowserClient> }
    var __SUPABASE_CLIENT__ : ReturnType<typeof createBrowserClient> | undefined
}

const getClient = () => {
    if (typeof globalThis !== "undefined") {
        // prefer existing global instance (avoids duplicate GoTrueClient instances)
        if ((globalThis as any).__SUPABASE_CLIENT__) return (globalThis as any).__SUPABASE_CLIENT__;
        const client = createBrowserClient(supabaseUrl!, supabaseKey!, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
        (globalThis as any).__SUPABASE_CLIENT__ = client;
        return client;
    }

    // fallback for non-browser environments
    return createBrowserClient(supabaseUrl!, supabaseKey!, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    });
};

export default getClient;
export const createClient = getClient;