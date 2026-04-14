/**
 * Detection logic for stationary systems (desktop).
 */

import { getClientURL } from "./common.js";
import { isSafari } from "./platform.js";

/**
 * @typedef {Object} AusweisApp2Status
 * @prop {"available" | "unavailable" | "unknown" | "safari" | "blocked" | "prompt" } status
 * @prop {AusweisApp2StatusResponse | null} details
 */

/**
 * Response body returned by the status response of the eID client.
 * @typedef {Object} AusweisApp2StatusResponse
 * @prop {string} implementationTitle
 * @prop {string} implementationVendor
 * @prop {string} implementationVersion
 * @prop {string} name
 * @prop {string} specificationTitle
 * @prop {string} specificationVendor
 * @prop {string} specificationVersion
 */

/**
 * @private
 * @param {any} json
 * @returns {AusweisApp2StatusResponse | null}
 */
function parseResponse(json) {
  if (json && typeof json === "object") {
    return {
      implementationTitle: json["Implementation-Title"],
      implementationVendor: json["Implementation-Vendor"],
      implementationVersion: json["Implementation-Version"],
      name: json["Name"],
      specificationTitle: json["Specification-Title"],
      specificationVendor: json["Specification-Vendor"],
      specificationVersion: json["Specification-Version"],
    };
  } else {
    return null;
  }
}

/**
 * Retrieve the current status of the eID client on the host platform.
 * Only works on desktop environments, where the eID client starts a background
 * http service.
 *
 * Works by trying to reach the status endpoint of the eID client as specified in
 * [TR-03124-1 eID-Client – Part 1: Specifications](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Publikationen/TechnischeRichtlinien/TR03124/TR-03124-1.pdf?__blob=publicationFile&v=1)
 *
 * Some browsers block requests to localhost origins due to mixed-content restrictions.
 * This function returns the `"unknown"` status in this case.
 *
 * eID clients don't start a background http server on mobile platforms.
 * The returned state is undefined in this case and one should check
 * the platform before using this function with the `isMobile` function.
 *
 * @returns {Promise<AusweisApp2Status>}
 */
export async function getStationaryStatus() {
  /**
   * Only a tiny internal TypeScript typing helper
   * @param {AusweisApp2Status["status"]} status
   * @param {AusweisApp2Status["details"]} details
   */
  function produceStatus(status, details) {
    return { status, details };
  }

  const url = getClientURL({ action: "status", json: true, mobile: false });
  const permissionState = await getLocalNetworkAccessPermissionState();

  try {
    const res = await fetch(url);

    if (res.status !== 200) {
      return produceStatus("unavailable", null);
    }

    const details = await res.json().then(
      (json) => parseResponse(json),
      () => null
    );
    return produceStatus("available", details);
  } catch (err) {
    if (permissionState === "prompt") {
      return produceStatus("prompt", null);
    }
    if (permissionState === "denied") {
      return produceStatus("blocked", null);
    }
    if (permissionState === "unsupported") {
      return produceStatus("unknown", null);
    }

    if (isSafari()) {
      return produceStatus("safari", null);
    }

    return produceStatus("unavailable", null);
  }
}

/**
 * Uses the browsers permission API to check for status of local network access. Works only on Chrome browsers
 * @returns {Promise<"denied"|"granted"|"prompt"|string>}
 */
async function getLocalNetworkAccessPermissionState() {
  try {
    const result = await navigator.permissions.query({
      // @ts-ignore
      name: "local-network-access",
    });
    return result.state;
  } catch (e) {
    return "unsupported";
  }
}
