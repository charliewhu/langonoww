<script lang="ts">
	import { page } from '$app/state'
	import * as services from '$lib/services'
	import TinybaseUOW from '$lib/services/uow'

	let id = $derived(page.params.id!)
	let uow = $derived(await TinybaseUOW.create())
	let text = $derived(await services.getText(uow, id))
</script>

{#if text}
	{#each text.words as word}
		<span>{word.name}</span>
		<span></span>
	{/each}
{:else}
	<p>Loading...</p>
{/if}
