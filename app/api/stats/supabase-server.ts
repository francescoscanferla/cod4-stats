import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
    const cookieStore = cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                async getAll() {
                    const resolvedCookies = await cookieStore;
                    return resolvedCookies.getAll().map(({ name, value }) => ({ name, value }));
                },
                async setAll(cookiesToSet) {
                    try {
                        const resolvedCookies = await cookieStore;
                        cookiesToSet.forEach(({ name, value, options }) =>
                            resolvedCookies.set({ name, value, ...options })
                        );
                    } catch {
                        return;
                    }
                },
            },
        }
    );
}