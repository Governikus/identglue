/**
 * Augments a HTML anchor element to provide feedback, if the user had an eID client installed
 * and the identification process started or not.
 *
 * Due to significant differences between the way mobile browsers handle custom protocol links,
 * this feature is considered very unstable and not ready for production use, yet.
 *
 * @param {HTMLAnchorElement} target - reference to the target DOM anchor element
 * @param {() => void} notInstalledCallback - callback, which is called, when this function decides that no eID client is installed
 * @experimental
 */
export function observeEIDLink(target, notInstalledCallback) {
  const url = target.href;

  let timer = 0;
  let activated = false;
  let blurred = false;

  let t = 0;

  // @ts-ignore
  // eslint-disable-next-line no-unused-vars
  function dbg(...args) {
    // @ts-ignore
    //console.log.apply(console, arguments);
  }

  function signal() {
    dbg("signal", Date.now() - t);
    activated = false;
    notInstalledCallback();
  }

  window.addEventListener("blur", () => {
    dbg("blur", activated, blurred, Date.now() - t);
    if (activated) {
      blurred = true;
      if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
    }
  });
  window.addEventListener("focus", () => {
    dbg("focus", activated, blurred, Date.now() - t);
    if (activated && blurred) {
      window.setTimeout(signal, 0);
    }
  });
  document.addEventListener("visibilitychange", () => {
    dbg(document.visibilityState, activated, blurred, Date.now() - t);
    if (activated && document.visibilityState === "hidden") {
      activated = false;
    }
  });

  target.addEventListener("click", (evt) => {
    evt.preventDefault();

    t = Date.now();

    blurred = false;
    activated = true;
    timer = window.setTimeout(() => {
      dbg(
        "timeout",
        activated,
        blurred,
        document.hasFocus(),
        document.visibilityState === "visible",
        Date.now() - t
      );
      if (activated && !blurred) signal();
    }, 1000);

    location.assign(url);
  });
}
