<script lang="ts">
	import { page } from '$app/state'
	import * as services from '$lib/services'
	import TinybaseUOW from '$lib/services/uow'

	let id = $derived(page.params.id!)
	let uow = $derived(await TinybaseUOW.create())
	let text = $derived(await services.getText(uow, id))
	let isCompleting = $state(false)
</script>

{#if !text}
	<p>Loading...</p>
{:else}
	{#each text.words as word}
		<span>{word.name}</span>
		<span></span>
	{/each}
{/if}

<button
	class="btn btn-block btn-primary"
	disabled={isCompleting}
	onclick={() => services.completeText(uow, text!.id)}
>
	{#if isCompleting}
		<span class="loading loading-sm loading-spinner"></span>
		Completing...
	{:else}
		Complete
	{/if}
</button>
