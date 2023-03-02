<script lang="ts">
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	let body: null | HTMLElement = null
	onMount(() => {
		body = document.querySelector('body')
	})
	$: {
		if (modalOpen && body) {
			body.style.overflow = 'hidden'
		} else if (body) {
			body.style.overflow = 'auto'
		}
	}
	export let modalOpen = false
</script>

{#if modalOpen}
	<div
		class="fixed top-0 left-0 flex h-screen w-screen items-center justify-center bg-black/50"
		in:fade={{ duration: 100 }}
		out:fade={{ duration: 100 }}
		on:click={() => (modalOpen = false)}
		on:keypress={() => (modalOpen = false)}>
		<slot />
	</div>
{/if}
