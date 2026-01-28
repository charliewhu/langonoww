<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'

	let { children } = $props()
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-base-100">
	<div class="navbar bg-base-200 shadow-sm">
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
		<div class="navbar-end">Langonoww</div>
	</div>
	<main class="mx-auto max-w-lg p-4">
		<svelte:boundary
			onerror={(error, reset) => {
				console.error('Application error:', error)
			}}
		>
			{@render children()}
			{#snippet failed(error, reset)}
				<div class="alert alert-error">
					<span>Something went wrong. Please try refreshing the page.</span>
					<button class="btn btn-sm" onclick={reset}>Retry</button>
				</div>
			{/snippet}
		</svelte:boundary>
	</main>
</div>
