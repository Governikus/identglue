import {
  ClientURLMobile,
  ClientURLStationary,
  getClientURL,
} from "../src/common.js";

describe("getClientURL", function () {
  it("exports the base client URLs", function () {
    // Note: This spec serves as a regression test
    // to prohibit unintended API changes.
    expect(ClientURLStationary).toBe("http://127.0.0.1:24727/eID-Client");
    expect(ClientURLMobile).toBe("eid://127.0.0.1:24727/eID-Client");
  });

  it("returns the base URL, when no options are provided", function () {
    expect(getClientURL()).toBe(ClientURLStationary);
  });

  var snapshots = {
    status: "http://127.0.0.1:24727/eID-Client?Status",
    status_json: "http://127.0.0.1:24727/eID-Client?Status=json",
    status_mobile: "eid://127.0.0.1:24727/eID-Client?Status",
    status_json_mobile: "eid://127.0.0.1:24727/eID-Client?Status=json",
    showui: "http://127.0.0.1:24727/eID-Client?ShowUI",
    showui_module: "http://127.0.0.1:24727/eID-Client?ShowUI=Settings",
  };

  it("matches the snapshot for the _status_ action", function () {
    expect(getClientURL({ mobile: false, action: "status" })).toBe(
      snapshots.status
    );
    expect(getClientURL({ mobile: false, action: "status", json: true })).toBe(
      snapshots.status_json
    );
    expect(getClientURL({ mobile: true, action: "status" })).toBe(
      snapshots.status_mobile
    );
    expect(getClientURL({ mobile: true, action: "status", json: true })).toBe(
      snapshots.status_json_mobile
    );
  });

  it("matches the snapshot for the _showui_ action", function () {
    expect(getClientURL({ mobile: false, action: "showui" })).toBe(
      snapshots.showui
    );
    expect(
      getClientURL({
        mobile: false,
        action: "showui",
        module: "Settings",
      })
    ).toBe(snapshots.showui_module);
  });

  it("encodes the tcTokenURL", function () {
    const tc = "https://example.com/api/eid/start?nonce=123";
    const url = getClientURL({ action: "connect", tcTokenURL: tc });
    expect(url).toContain(encodeURIComponent(tc));
  });
});
