<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'

	import { createTinybaseUow } from '$lib/services/uow.svelte'
	import * as services from '$lib/services'

	let title = $state('')
	let content = $state('')

	async function addText(event: Event) {
		event.preventDefault()
		const uow = await createTinybaseUow()
		services.createText(uow, '1', { title, content })
		goto(resolve('/texts'))
	}
</script>

<div class="mb-4">
	<a href="/texts" class="link text-base-content/50 link-hover">Back to texts</a>
</div>

<div>
	<h1 class="mb-4 text-3xl font-bold">Add Text</h1>

	<form onsubmit={addText}>
		<fieldset class="fieldset">
			<label class="fieldset-legend" for="title">Title</label>
			<input
				type="text"
				class="input w-full"
				id="title"
				placeholder="Le Petit Prince"
				bind:value={title}
			/>
		</fieldset>
		<fieldset class="fieldset">
			<label class="fieldset-legend" for="content">Content</label>
			<textarea
				class="textarea h-24 w-full"
				id="content"
				placeholder="Lorsque j'avais six ans j'ai vu..."
				bind:value={content}
			></textarea>
		</fieldset>
		<button type="submit" class="btn btn-block btn-primary">Create</button>
	</form>
</div>
