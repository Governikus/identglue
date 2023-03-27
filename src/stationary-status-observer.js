/**
 *
 */

import { dequal } from "dequal/lite";
import { isMobile, isSafari } from "./platform.js";
import { getStationaryStatus } from "./stationary.js";

/**
 * @typedef {import("./stationary").AusweisApp2Status} AusweisApp2Status
 */

/**
 * @callback OnStatusChangeCallback
 * @param {StationaryStatusObserver} this
 * @param {AusweisApp2Status} status
 * @returns {void}
 */

/**
 * @typedef {Object} Options
 * @prop {number} [refreshInterval] polling interval (set to 0 to disable, time in milliseconds)
 * @prop {boolean} [refreshWhenHidden] polling when the window is invisible (if refreshInterval is enabled)
 * @prop {boolean} [refreshOnFocus] refresh when the window gets focused
 * @prop {number} [focusThrottleInterval] only refresh once during this time span (in milliseconds)
 */

/**
 * The StationaryStatusObserver class provides a way to observe changes (user starts or quits the eID client)
 * to the state of the eID client on the clients platform.
 */
export class StationaryStatusObserver {
  #options;
  #onStatusChangeCallback;
  #nextFocusRefresh = 0;
  #refreshTimer = 0;

  /** @type {AusweisApp2Status | null} */
  #status = null;

  /** Read the last known status. Might be null, if the observer hasn't started observing. */
  get status() {
    return this.#status;
  }

  /**
   * Creates a new StationaryStatusObserver instance.
   *
   * To start receiving status updates, you must call {@link observe} first.
   *
   * @param {OnStatusChangeCallback} onStatusChange - callback function when the status changes
   * @param {Options} [options] - optional object which customizes the observers' behaviour
   */
  constructor(onStatusChange, options) {
    /** @type {Required<Options>} */
    const defaultOptions = {
      refreshInterval: 10000,
      refreshWhenHidden: false,
      refreshOnFocus: true,
      focusThrottleInterval: 5000,
    };
    this.#options = { ...defaultOptions, ...options };

    if (typeof onStatusChange !== "function") {
      throw new TypeError("onStatusChange argument must be a function.");
    }
    this.#onStatusChangeCallback = onStatusChange;
  }

  /** Start observing the status. */
  observe() {
    if (isMobile()) {
      // The local AA2 server is only available on stationary systems.
      this.#updateStatus({ status: "unknown", details: null });
      return;
    }

    /** Safari Browser blocks localhost calls */
    if (isSafari()) {
      this.#updateStatus({ status: "safari", details: null });
      return;
    }

    if (this.#options.refreshInterval > 0) {
      this.#startPolling();
    }
    if (this.#options.refreshOnFocus) {
      window.addEventListener("focus", this.#handleFocus);
    }
  }

  /**
   * Stops observing the status.
   * Make sure to call this function, when the user navigates away from the
   * eID section, to free resources and stop the timers.
   */
  unobserve() {
    if (this.#refreshTimer) {
      window.clearTimeout(this.#refreshTimer);
      this.#refreshTimer = -1;
    }
    if (this.#options.refreshOnFocus) {
      window.removeEventListener("focus", this.#handleFocus);
    }
  }

  /**
   * Manually trigger a refresh of the current eID client status.
   */
  async refresh() {
    const nextStatus = await getStationaryStatus();
    this.#updateStatus(nextStatus);
  }

  // --- private methods

  /**
   * @param {AusweisApp2Status} nextStatus
   */
  #updateStatus(nextStatus) {
    if (!dequal(this.#status, nextStatus)) {
      this.#status = nextStatus;
      this.#onStatusChangeCallback.call(this, nextStatus);
    }
  }

  #handleFocus = () => {
    const now = Date.now();
    if (this.#options.refreshOnFocus && now > this.#nextFocusRefresh) {
      this.#nextFocusRefresh = now + this.#options.focusThrottleInterval;
      this.refresh();
    }
  };

  #startPolling = () => {
    const next = () => {
      // abort, if #refreshTimer is set to -1.
      if (this.#refreshTimer !== -1) {
        this.#refreshTimer = window.setTimeout(
          execute,
          this.#options.refreshInterval
        );
      }
    };

    const execute = () => {
      if (
        this.#options.refreshWhenHidden ||
        document.visibilityState !== "hidden"
      ) {
        this.refresh().then(next);
      } else {
        next();
      }
    };

    execute();
  };
}
