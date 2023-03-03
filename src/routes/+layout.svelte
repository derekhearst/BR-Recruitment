<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client'
	import '../app.postcss'
	import type { PageData } from './$types'
	import { navigating } from '$app/stores'
	import { goto } from '$app/navigation'
	export let data: PageData
</script>

<nav class="flex  items-center justify-between border-b-4 border-b-red-800 bg-white  p-2 text-xl">
	<div class="flex items-center gap-4">
		<img src="/brlogo.svg" alt="brown and root logo" class="h-20" />
		<a href="/">Home</a>
		<a href="/location/1">Baton Rouge</a>
		<a href="/location/2">Deer Park</a>
		<a href="/location/3">Corpus Christi</a>
	</div>
	<div class="flex items-center gap-4">
		{#if !data.session}
			<button class="styledButton" on:click={() => signIn('azure-ad')}>Login</button>
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
