import { SvelteKitAuth } from '@auth/sveltekit'
import Azure from '@auth/core/providers/azure-ad'
import { AZ_CLIENT_ID, AZ_CLIENT_SECRET, AZ_TENANT_ID } from '$env/static/private'

export const handle = SvelteKitAuth({
	providers: [
		//@ts-expect-error - https://github.com/nextauthjs/next-auth/issues/6174
		Azure({
			clientId: AZ_CLIENT_ID,
			clientSecret: AZ_CLIENT_SECRET,
			tenantId: AZ_TENANT_ID,
			authorization: {
				params: {
					scope: 'openid profile email api://861ed1f1-9083-4301-ba44-f9ec11d643f2/access_as_user'
				}
			}
		})
	],
	callbacks: {
		async session({ session, token }) {
			if (token) {
				// @ts-expect-error until i can figure out how to retype this, then this stays
				session.accessToken = token.accessToken
			}
			return session
		},
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token
			}
			return token
		}
	},
	theme: {
		logo: '/logo.jpg',
		brandColor: '#b2292e'
	}
})
