<script lang="ts">
	import * as services from '$lib/services'
	import TinybaseUOW from '$lib/services/uow'

	let uow = $state(await TinybaseUOW.create())
	let reader = $derived(services.getReader(uow, '1'))
</script>

<a href="/texts/add" class="link">Add Text</a>

{#if !reader}
	<p class="text-center text-base-content/50">Loading texts...</p>
{:else if !reader.texts}
	<p class="text-center text-base-content/50">
		No texts yet. <a href="/texts/add" class="link">Add your first text</a>
		.
	</p>
{:else}
	<ul class="list">
		{#each reader.texts as row}
			<li class="list-row">
				<a href={`/texts/${row.id}`} class="link link-hover">{row.title}</a>
			</li>
		{/each}
	</ul>
{/if}
