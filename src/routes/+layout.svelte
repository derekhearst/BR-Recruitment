<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client'
	import '../app.postcss'
	import type { PageData } from './$types'
	import { navigating } from '$app/stores'
	export let data: PageData
</script>

<nav class="flex w-screen items-center justify-between p-2 text-xl">
	<div class="flex gap-4">
		<a href="/">Home</a>
		<div class="flex gap-2">
			[
			<a href="/location/1">Boise Calendar</a>
			|
			<a href="/location/2">Baton Rouge Calendar</a>
			]
		</div>
	</div>
	<div class="flex items-center gap-4">
		{#if !data.session}
			<button class="styledButton" on:click={() => signIn()}>Login</button>
		{:else}
			<h1>Welcome {data.session.user.name}</h1>
			<button class="styledButton" on:click={signOut}>Logout</button>
		{/if}
	</div>
</nav>

{#if $navigating}
	<div class="flex items-center justify-center">
		<div class="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-gray-900" />
	</div>
{:else}
	<slot />
{/if}

<style>
	a {
		text-decoration: underline;
		color: #b2292e;
	}
</style>
