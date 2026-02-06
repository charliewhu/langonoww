<script lang="ts">
	import { page } from '$app/state'
	import * as services from '$lib/services'
	import { uow } from '$lib/services/uow.svelte'

	let id = $derived(page.params.id!)

	let text = $derived(await services.getText(uow, id))
	$inspect(text)
</script>

<div class="mb-6">
	{#if !text}
		<p>Loading...</p>
	{:else}
		{#each text.words as word}
			{#if !word.word}
				<!-- Spaces and punctuation -->
				<!-- Put negative left margin to negate spaces with last word -->
				<span class="-ml-0.5">{word.name}</span>
			{:else}
				<div class="tooltip tooltip-bottom">
					<div class="tooltip-content delay-200">
						<div class="text-orange-400 font-black">Word status: {word.word.status}</div>
					</div>
					{#if word.word.status === 'unknown'}
						<!-- New words -->
						<button
							class="rounded bg-success text-success-content px-0.5 m-0.5"
							onclick={async () => await services.markWordDifficult(uow, word.word!.id)}
						>
							{word.name}
						</button>
					{:else if word.word.status === 'difficult'}
						<!-- Difficult words -->
						<button
							class="rounded bg-warning text-warning-content px-1 my-0.5"
							onclick={async () => await services.markWordKnown(uow, word.word!.id)}
						>
							{word.name}
						</button>
					{:else if word.word.status === 'known'}
						<!-- Known words -->
						<button
							class="rounded px-1 my-0.5"
							onclick={async () => await services.markWordDifficult(uow, word.word!.id)}
						>
							{word.name}
						</button>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>

<button class="btn btn-block btn-primary" onclick={() => services.completeText(uow, text!.id)}>
	Complete
</button>
