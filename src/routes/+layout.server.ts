import { redirect, error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.getSession()

	if (!session) {
		throw redirect(303, '/auth/signin?error=SessionRequired')
	}

	return {
		session: session
	}
}
