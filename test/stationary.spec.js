import { fetch as fetchPolyfill } from "whatwg-fetch";

import { getStationaryStatus } from "../src/stationary.js";

describe("getStationaryStatus", function () {
  var aa2AppUrl = "http://127.0.0.1:24727/eID-Client?Status=json";
  var aa2StatusResponse = JSON.stringify({
    "Implementation-Title": "AusweisApp2",
    "Implementation-Vendor": "Governikus GmbH & Co. KG",
    "Implementation-Version": "1.22.2",
    Name: "AusweisApp2",
    "Specification-Title": "TR-03124",
    "Specification-Vendor": "Federal Office for Information Security",
    "Specification-Version": "1.3",
  });

  var originalFetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    window.fetch = fetchPolyfill;
    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
    window.fetch = originalFetch;
  });

  it("should emit the `available` status and return details, when the AA2 is running", function () {
    jasmine.Ajax.stubRequest(aa2AppUrl).andReturn({
      status: 200,
      statusText: "HTTP/1.0 200 OK",
      contentType: "application/json",
      responseHeaders: {
        "access-control-allow-origin": "*",
        server: "AusweisApp2/1.22.2 (TR-03124-1/1.3)",
      },
      response: aa2StatusResponse,
    });

    return getStationaryStatus().then(function (status) {
      expect(status.status).toBe("available");
      expect(status.details).toEqual({
        implementationTitle: "AusweisApp2",
        implementationVendor: "Governikus GmbH & Co. KG",
        implementationVersion: "1.22.2",
        name: "AusweisApp2",
        specificationTitle: "TR-03124",
        specificationVendor: "Federal Office for Information Security",
        specificationVersion: "1.3",
      });
    });
  });

  it("should resolve the 'unavailable' status, when the AA2 does not respond", function () {
    jasmine.Ajax.stubRequest(aa2AppUrl).andTimeout();

    return getStationaryStatus().then(function (status) {
      expect(status.status).toBe("unavailable");
    });
  });

  it("should resolve the 'unavailable' status, when the AA2 responds with error status code", function () {
    jasmine.Ajax.stubRequest(aa2AppUrl).andError({
      status: 404,
    });

    return getStationaryStatus().then(function (status) {
      expect(status.status).toBe("unavailable");
    });
  });

  it("should resolve the 'unknown' status, when the browser blocks the fetch call", function () {
    jasmine.Ajax.stubRequest(aa2AppUrl).andCallFunction(function () {
      throw new TypeError("Not allowed to request resource");
    });

    return getStationaryStatus().then(function (status) {
      expect(status.status).toBe("unknown");
    });
  });
});
