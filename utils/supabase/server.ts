import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const buildCookieAdapter = (cookieStore: Awaited<ReturnType<typeof cookies>>): CookieMethodsServer => ({
    getAll: () => {
        const rawCookies = cookieStore.getAll?.() ?? [];
        if (!Array.isArray(rawCookies)) return [];
        return rawCookies.map((cookie) => ({ name: cookie.name, value: cookie.value }));
    },
    setAll: (cookiesToSet, _headers) => {
        if (typeof cookieStore.set !== "function") return;

        cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
        });
    },
});

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>, accessToken?: string) => {
    const options: any = {
        cookies: buildCookieAdapter(cookieStore),
    };

    if (accessToken) {
        options.headers = { Authorization: `Bearer ${accessToken}` };
    }

    return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        options,
    );
};
