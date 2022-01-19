/**
 *
 */

import { isMobile } from "./platform.js";

export const ClientURLStationary = "http://127.0.0.1:24727/eID-Client";
export const ClientURLMobile = "eid://127.0.0.1:24727/eID-Client";

/**
 * @typedef {Object} ConnectAction
 * @prop {"connect"} action
 * @prop {string} tcTokenURL
 */

/**
 * @typedef {Object} StatusAction
 * @prop {"status"} action
 * @prop {boolean} [json]
 */

/**
 * @typedef {Object} ShowUIAction
 * @prop {"showui"} action
 * @prop {"PINManagement" | "Settings"} [module]
 */

/**
 * @typedef {Object} GetClientURLCommonOptions
 * @prop {boolean} [mobile] Override the automatic detection based on the user agent.
 */

/**
 * @typedef {(ConnectAction | StatusAction | ShowUIAction) & GetClientURLCommonOptions} GetClientURLOptions
 */

/**
 *
 * @param {GetClientURLOptions} [options]
 * @returns {string}
 */
export function getClientURL(options) {
  let mobile = options && options.mobile;
  if (typeof mobile === "undefined") mobile = isMobile();

  let url = mobile ? ClientURLMobile : ClientURLStationary;

  if (typeof options === "undefined") return url;

  if (typeof options !== "object")
    throw new TypeError("Argument options must be an object.");

  if (options.action === "connect") {
    if (typeof options.tcTokenURL !== "string")
      throw new TypeError("Value options.tcTokenURL must be a string.");

    return `${url}?tcTokenURL=${encodeURIComponent(options.tcTokenURL)}`;
  }

  if (options.action === "status") {
    return `${url}?Status${options.json === true ? "=json" : ""}`;
  }

  if (options.action === "showui") {
    return `${url}?ShowUI${
      typeof options.module === "string"
        ? "=" + encodeURIComponent(options.module)
        : ""
    }`;
  }

  return url;
}
