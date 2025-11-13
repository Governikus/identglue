/**
 * Functions related to detecting the current platform.
 */

/**
 * @returns {boolean}
 */
export function isMobile() {
  if (navigator.userAgentData && "mobile" in navigator.userAgentData) {
    return navigator.userAgentData.mobile;
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera;
  if (
    /android|iphone|ipod|ipad|mobile|blackberry|iemobile|opera mini/i.test(ua)
  ) {
    return true;
  }

  // iPadOS 13+ mimics a desktop device
  // so a check on touchscreen support is needed
  const isAppleDesktop = /Macintosh/.test(ua);
  if (isAppleDesktop && "ontouchend" in document) {
    return true;
  }
  const oldMobileRegex =
    /nokia|symbian|palm|windows ce|blackberry|meego|mobile.+firefox/i;
  return oldMobileRegex.test(ua);
}
/**
 * @returns {boolean}
 */
export function isSafari() {
  let isSafari = false;
  if (navigator.vendor != null) {
    isSafari =
      navigator.vendor === "Apple Computer, Inc." &&
      navigator.userAgent.indexOf("Safari") !== -1;
  }
  return isSafari;
}

/**
 * @returns {boolean}
 */
export function isChromeOS() {
  const regex = /CrOS/;
  let isChromeOS = false;
  if (navigator.vendor != null) {
    isChromeOS =
      navigator.vendor === "Google Inc." && regex.test(navigator.userAgent);
  }
  return isChromeOS;
}
