import { fetch as fetchPolyfill } from "whatwg-fetch";

import { StationaryStatusObserver } from "../src/stationary-status-observer.js";

describe("StationaryStatusObserver", function () {
  var sso, cb;

  var aa2AppUrl = "http://127.0.0.1:24727/eID-Client?Status=json";

  var originalFetch;

  beforeEach(() => {
    // jasmine.clock().install();

    originalFetch = window.fetch;
    window.fetch = fetchPolyfill;
    jasmine.Ajax.install();

    cb = jasmine.createSpy("onStatusChange");
  });

  afterEach(() => {
    if (sso) {
      sso.unobserve();
      sso = undefined;
    }

    jasmine.Ajax.uninstall();
    window.fetch = originalFetch;

    // jasmine.clock().uninstall();
  });

  it("constructor throws, when no callback is provided", function () {
    expect(function () {
      new StationaryStatusObserver();
    }).toThrowError(TypeError);
  });

  it("starts fetching the status", function (done) {
    jasmine.Ajax.stubRequest(aa2AppUrl).andReturn({
      status: 200,
      statusText: "HTTP/1.0 200 OK",
    });

    sso = new StationaryStatusObserver(cb);
    expect(sso.status).toBe(null);
    sso.observe();

    // let the event loop clear

    window.setTimeout(function () {
      expect(cb).to;
      expect(cb).toHaveBeenCalledOnceWith({
        status: "available",
        details: null,
      });
      done();
    }, 10);

    // jasmine.clock().tick(10);
  });
});
