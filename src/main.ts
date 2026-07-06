/**
 * Boot module — mirrors the abeto pattern:
 * minimal HTML shell → this entry script → App3D mounts the world.
 */
import { App3D } from './App3D';

const loadingEl = document.getElementById('loading')!;
const statusEl = document.getElementById('loading-status')!;

// Never fail silently — surface any uncaught error on screen.
function showFatal(msg: string) {
  loadingEl.classList.remove('hidden');
  statusEl.textContent = `ERROR: ${msg}`;
  (statusEl as HTMLElement).style.color = '#ff8a7a';
}
window.addEventListener('error', (e) => showFatal(e.message));
window.addEventListener('unhandledrejection', (e) =>
  showFatal(e.reason?.message ?? String(e.reason)),
);

async function boot() {
  try {
    statusEl.textContent = 'WARMING UP THE RENDERER…';
    const app = new App3D(document.getElementById('app')!);
    await app.init((msg) => (statusEl.textContent = msg));
    app.start();

    loadingEl.classList.add('hidden');
    setTimeout(() => loadingEl.remove(), 700);
  } catch (err) {
    console.error(err);
    showFatal(err instanceof Error ? err.message : 'FAILED TO START — CHECK CONSOLE');
  }
}

boot();
