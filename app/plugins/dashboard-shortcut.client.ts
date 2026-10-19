/**
 * Ctrl+Shift+D switches between the wall and /dashboard. The kiosk browser has no address bar, and
 * the dashboard must run in the same browser profile as the wall because its settings live in that
 * profile's localStorage. An app-lifetime listener, like the settings-storage plugin.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter();
  window.addEventListener('keydown', (event) => {
    if (!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey || event.code !== 'KeyD' || event.repeat)
      return;
    event.preventDefault();
    router.push(router.currentRoute.value.path.startsWith('/dashboard') ? '/' : '/dashboard');
  });
});
