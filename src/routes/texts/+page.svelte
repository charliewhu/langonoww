<script lang="ts">
	import TinybaseUOW from '$lib/services/uow'
	import * as services from '$lib/services'

	const uow = new TinybaseUOW()
	let texts = services.getAllTexts(uow)
</script>

<a href="/texts/add" class="link">Add Text</a>

{#if !texts}
	<p class="text-center text-base-content/50">
		No texts yet. <a href="/texts/add" class="link">Add your first text</a>
		.
	</p>
{:else}
	<ul class="list">
		{#each texts as row}
			<li class="list-row">
				<a href={`/texts/${row.id}`} class="link link-hover">{row.title}</a>
			</li>
		{/each}
	</ul>
{/if}
