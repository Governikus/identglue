/**
 * The NavigatorUAData interface of the User-Agent Client Hints API
 * returns information about the browser and operating system of a user.
 */
interface NavigatorUAData {
  readonly brands: { brand: string; version: string }[];
  readonly mobile: boolean;
}

interface Navigator {
  /**
   * The userAgentData read-only property of the Navigator interface returns
   * a NavigatorUAData object which can be used to access the User-Agent Client Hints API.
   *
   * This API is still experimental.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API}
   * @see {@link https://wicg.github.io/ua-client-hints/}
   */
  userAgentData: NavigatorUAData;
}

/**
 * Available in older Opera versions.
 * Note: as we have no special case for opera browsers, we probably don't need this.
 */
declare var opera: any;
