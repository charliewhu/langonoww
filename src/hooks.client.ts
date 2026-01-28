import { dev } from '$app/environment'

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.ts', {
		type: dev ? 'module' : 'classic',
	})
}

