/**
 * Kiosk browsers (the TouchDesigner Web Render TOP, the event PC's kiosk) keep the wall open for
 * days and never navigate, so they would run an old build after a deployment. When Nuxt detects a
 * newer build (`app:manifest:update`, checked every experimental.checkOutdatedBuildInterval), the
 * wall reloads at once; /dashboard waits until the operator leaves it, so unsaved edits survive.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  let outdated = false;

  const onDashboard = (path: string) => path.startsWith('/dashboard');

  nuxtApp.hook('app:manifest:update', () => {
    outdated = true;
    if (!onDashboard(router.currentRoute.value.path))
      window.location.reload();
  });

  router.afterEach((to) => {
    if (outdated && !onDashboard(to.path))
      window.location.reload();
  });
});
