import { isMobile, isSafari } from "../src/platform.js";

describe("platform", function () {
  var originalUserAgentData = window.navigator.userAgentData;
  var originalUserAgent = window.navigator.userAgent;
  var originalVendor = window.navigator.vendor;

  beforeEach(function () {
    // disable client hints API as the support is not very broad, today.
    navigator.__defineGetter__("userAgentData", function () {
      return undefined;
    });
  });

  afterEach(function () {
    // Reset browser userAgent to avoid issues with other tests and asynchronous calls
    navigator.__defineGetter__("userAgentData", function () {
      return originalUserAgentData;
    });
    navigator.__defineGetter__("userAgent", function () {
      return originalUserAgent;
    });
    navigator.__defineGetter__("vendor", function () {
      return originalVendor;
    });
  });

  describe("isMobile", function () {
    it("should return false on desktop browsers", function () {
      expect(isMobile()).toBe(false);
    });

    it("should return true on iOS Safari", function () {
      navigator.__defineGetter__("userAgent", function () {
        return "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1";
      });
      navigator.__defineGetter__("vendor", function () {
        return "Apple Computer, Inc.";
      });

      expect(isMobile()).toBe(true);
    });

    it("should return true on mobile browsers supporting client hints API", function () {
      navigator.__defineGetter__("userAgentData", function () {
        return { mobile: true };
      });

      expect(isMobile()).toBe(true);
    });

    it("should return true on Android Samsung S9 Chrome 62", function () {
      navigator.__defineGetter__("userAgent", function () {
        return "Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36";
      });

      expect(isMobile()).toBe(true);
    });
  });

  describe("isSafari", function () {
    it("should return false in chrome and firefox", function () {
      expect(isSafari()).toBe(false);
    });

    it("should return true on iOS Safari", function () {
      navigator.__defineGetter__("userAgent", function () {
        return "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1";
      });
      navigator.__defineGetter__("vendor", function () {
        return "Apple Computer, Inc.";
      });

      expect(isSafari()).toBe(true);
    });
    it("should return true on macOS Safari", function () {
      navigator.__defineGetter__("userAgent", function () {
        return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15";
      });
      navigator.__defineGetter__("vendor", function () {
        return "Apple Computer, Inc.";
      });

      expect(isSafari()).toBe(true);
    });
  });
});
