import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const buildCookieAdapter = (request: NextRequest, response: NextResponse): CookieMethodsServer => ({
    getAll: () => request.cookies.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value })),
    setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
        });

        Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
    },
});

export const createClient = (request: NextRequest, response: NextResponse) =>
    createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: buildCookieAdapter(request, response),
        },
    );
