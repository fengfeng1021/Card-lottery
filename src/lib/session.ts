/**
 * Fresh session on every open.
 *
 * The box counter that holds entries back for their deferred draws is kept in memory, so a full
 * page load starts it over. A browser tab is reloaded by hand, but a web app added to the iOS home
 * screen is not: the system suspends it and later resumes the very same page, counter and all.
 * Reload once when the app comes back to the front so that every open is a fresh session.
 */

/** True while the page runs as an installed web app rather than inside a browser tab. */
const isInstalledWebApp = (): boolean => {
  const standalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return standalone === true || window.matchMedia('(display-mode: standalone)').matches;
};

export const reloadOnResume = (): void => {
  if (typeof window === 'undefined' || !isInstalledWebApp()) return;

  // The page starts in the foreground, so a hide has to be seen before a resume counts as a reopen.
  let wasHidden = false;
  let reloading = false;

  const reloadOnce = () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      wasHidden = true;
      return;
    }
    if (wasHidden) reloadOnce();
  };

  // Safari hands a suspended web app back from its page cache without a visibility change.
  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) reloadOnce();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pageshow', onPageShow);
};
