<script lang="ts">
	import { page } from '$app/state'
	import * as services from '$lib/services'
	import { uow } from '$lib/services/uow.svelte'

	let id = $derived(page.params.id!)

	let text = $derived(await services.getText(uow, id))
</script>

{#if !text}
	<p>Loading...</p>
{:else}
	{#each text.words as word}
		{#if word.word && word.word.status === 'unknown'}
			<button
				class="rounded bg-green-800 px-1"
				onclick={async () => await services.markWordDifficult(uow, word.word!.id)}
			>
				{word.name}
			</button>
		{:else if word.word && word.word.status === 'difficult'}
			<button
				class="rounded bg-orange-800 px-1"
				onclick={async () => await services.markWordKnown(uow, word.word!.id)}
			>
				{word.name}
			</button>
		{:else if word.word}
			<button
				class="rounded px-1"
				onclick={async () => await services.markWordDifficult(uow, word.word!.id)}
			>
				{word.name}
			</button>
		{:else}
			<span>{word.name}</span>
		{/if}
		<span></span>
	{/each}
{/if}

<button class="btn btn-block btn-primary" onclick={() => services.completeText(uow, text!.id)}>
	Complete
</button>
