<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import * as services from '$lib/services'
	import { createTinybaseUow } from '$lib/services/uow.svelte'

	let { children } = $props()

	let uow = $state(await createTinybaseUow())
	let knownWordsCount = $derived(services.getKnownWordsCount(uow))
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-base-100">
	<nav class="navbar bg-base-200 z-100">
		<div class="flex-1">
			<a href="/" class="btn text-xl btn-ghost">Langonow</a>
		</div>
		<div class="navbar-end">
			<ul class="menu menu-horizontal px-1">
				<li><a href="/texts">Texts</a></li>
				<li>
					<details>
						<summary>Parent</summary>
						<ul class="rounded-t-none bg-base-200 p-2">
							<li><a>Link 1</a></li>
							<li><a>Link 2</a></li>
						</ul>
					</details>
				</li>
			</ul>
		</div>
		<div class="navbar-end">
			<p data-testid="known-words">Known Words: {await knownWordsCount}</p>
		</div>
	</nav>
	<main class="mx-auto max-w-lg p-4">
		{@render children()}
	</main>
</div>
