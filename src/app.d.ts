// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { DefaultSession } from '@sveltejs/kit/types'
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		interface Session extends DefaultSession {
			user: {
				name: string
			}
			accessToken: string
		}
	}
}

export {}
