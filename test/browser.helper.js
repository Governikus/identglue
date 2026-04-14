export class BrowserHelper {
  static getBrowser() {
    const ua = navigator.userAgent;

    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";

    return "unknown";
  }

  static isChrome() {
    return this.getBrowser() === "Chrome";
  }

  static isFirefox() {
    return this.getBrowser() === "Firefox";
  }
}
