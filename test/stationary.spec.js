import { fetch as fetchPolyfill } from "whatwg-fetch";

import { getStationaryStatus } from "../src/stationary.js";

describe("getStationaryStatus", function () {
  var ausweisAppUrl = "http://127.0.0.1:24727/eID-Client?Status=json";
  var ausweisAppStatusResponseLegacy = JSON.stringify({
    "Implementation-Title": "AusweisApp2",
    "Implementation-Vendor": "Governikus GmbH & Co. KG",
    "Implementation-Version": "1.26.4",
    Name: "AusweisApp2",
    "Specification-Title": "TR-03124",
    "Specification-Vendor": "Federal Office for Information Security",
    "Specification-Version": "1.3",
  });

  var ausweisAppStatusResponse = JSON.stringify({
    "Implementation-Title": "AusweisApp",
    "Implementation-Vendor": "Governikus GmbH & Co. KG",
    "Implementation-Version": "2.0.0",
    Name: "AusweisApp",
    "Specification-Title": "TR-03124",
    "Specification-Vendor": "Federal Office for Information Security",
    "Specification-Version": "1.4",
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

  it("should emit the `available` status and return details, when the older AusweisApp version is running", function () {
    jasmine.Ajax.stubRequest(ausweisAppUrl).andReturn({
      status: 200,
      statusText: "HTTP/1.0 200 OK",
      contentType: "application/json",
      responseHeaders: {
        "access-control-allow-origin": "*",
        server: "AusweisApp2/1.26.4 (TR-03124-1/1.3)",
      },
      response: ausweisAppStatusResponseLegacy,
    });

    return getStationaryStatus().then(function (status) {
      expect(status.status).toBe("available");
      expect(status.details).toEqual({
        implementationTitle: "AusweisApp2",
        implementationVendor: "Governikus GmbH & Co. KG",
        implementationVersion: "1.26.4",
        name: "AusweisApp2",
        specificationTitle: "TR-03124",
        specificationVendor: "Federal Office for Information Security",
        specificationVersion: "1.3",
      });
    });
  });

  it("should emit the `available` status and return details, when the new AusweisApp version is running", function () {
    jasmine.Ajax.stubRequest(ausweisAppUrl).andReturn({
      status: 200,
      statusText: "HTTP/1.0 200 OK",
      contentType: "application/json",
      responseHeaders: {
        "access-control-allow-origin": "*",
        server: "AusweisApp2/2.0.0 (TR-03124-1/1.4)",
      },
      response: ausweisAppStatusResponse,
    });

    return getStationaryStatus().then(function (status) {
      expect(status.status).toBe("available");
      expect(status.details).toEqual({
        implementationTitle: "AusweisApp",
        implementationVendor: "Governikus GmbH & Co. KG",
        implementationVersion: "2.0.0",
        name: "AusweisApp",
        specificationTitle: "TR-03124",
        specificationVendor: "Federal Office for Information Security",
        specificationVersion: "1.4",
      });
    });
  });

  it("should resolve the 'unavailable' status, when the AusweisApp does not respond", function () {
    jasmine.Ajax.stubRequest(ausweisAppUrl).andTimeout();

    return getStationaryStatus().then(function (status) {
      expect(status.status).toBe("unavailable");
    });
  });

  it("should resolve the 'unavailable' status, when the AusweisApp responds with error status code", function () {
    jasmine.Ajax.stubRequest(ausweisAppUrl).andError({
      status: 404,
    });

    return getStationaryStatus().then(function (status) {
      expect(status.status).toBe("unavailable");
    });
  });

  it("should resolve the 'unknown' status, when the browser blocks the fetch call", function () {
    jasmine.Ajax.stubRequest(ausweisAppUrl).andCallFunction(function () {
      throw new TypeError("Not allowed to request resource");
    });

    return getStationaryStatus().then(function (status) {
      expect(status.status).toBe("unknown");
    });
  });
});
