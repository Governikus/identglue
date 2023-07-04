# `@ausweisapp2/identglue`

This library allows webpages to integrate seamlessly with the German eID system. It provides client-side helpers to detect or open an eID client and start an identification process from the browser.

## Features

- Detection if an eID client is running on desktop systems <sup id="a1">[1](#f1)</sup>
- Helpers for creating spec-compliant eID client URLs
  - Use them with frameworks and libaries like React, Vue, Svelte, etc. or server side rendered pages.
- Rules out cross platform differences
- Experimental: Detection on mobile platforms and ChromeOS

## Installation

### Option 1 - Install with npm/yarn/pnpm:

```bash
npm install @ausweisapp2/identglue
```

### Option 2 - Load the script via a CDN:

```html
<script defer src="https://unpkg.com/@ausweisapp2/identglue"></script>
```

The script exports all functions under the `AusweisApp2` namespace on the global object,
or use the direct call to the script with a specific version.

```html
<script src="https://unpkg.com/@ausweisapp2/identglue@1.0.4/dist/identglue.umd.js"></script>
```

## Usage

You can find more detailed usage examples in the [docs/examples](./docs/examples) folder.

There are different possible ways of launching the eID client suitable for different platforms or scenarios:

1. **Stationary Desktop Flow:** The user visits the webpage on his desktop browser. Here, the user is expected to install an eID client on its desktop operating system and have a card reader attached.
2. **Mobile Flow:** The user visits the webpage on his mobile device and completes the identification flow on the same device.
3. **QR-Code Flow:** This is a hybrid flow, where the users lands on the web service using his desktop machine, but wants to use his mobile device to complete the identification.

Each of the three flows is explained in detail below.

### 1. Stationary Desktop Flow

```javascript
import { StationaryStatusObserver } from "@ausweisapp2/identglue";

const observer = new StationaryStatusObserver((status) => {
  // status changed! now, update your UI
  if (status.status === "available") {
    // TODO: enable the "Start Identification" button
  } else if (status.status === "unavailable") {
    // TODO: display a message to the users, asking to install and start the eID client.
  } else if (status.status === "safari") {
    // TODO: display a message to the users, asking to install and start the eID client for Safari Browser.
  } else {
    // TODO: display a generic warning message and enable the "Start Identification" button
  }
});

observer.observe();
```

### 2. Mobile Flow

```js
import { observeEIDLink, getClientURL } from "@ausweisapp2/identglue";

const btn = document.getElementById("eid_btn");

btn.href = getClientURL({
  action: "connect",
  tcTokenURL: "https://yourserver.com/api/eid/start",
});

observeEIDLink(btn, () => {
  // show alert ...
});
```

### 3. QR-Code Flow

```js
import { getClientURL } from "@ausweisapp2/identglue";

const url = getClientURL({
  mobile: true,
  action: "connect",
  tcTokenURL: "https://yourserver.com/api/eid/start",
});
```

Use your favorite QR-code library to render a QR-code (for example the [`qrcode`](https://npm.im/qrcode) npm library).

```js
import qrcode from "qrcode";

const dataURL = await qrcode.toDataURL(
  url /* the value from the previous snippet */,
  { scale: 4 }
);

const img = document.createElement("img");
img.src = dataURL;
// insert the <img> element at the appropriate place:
document.body.appendChild(img);
```

## Learn more

If you want to learn more about integrating the eID functionality into your system, the following resources might be usefull:

- [TR-03124-1 eID-Client - Part 1: Specifications](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Publikationen/TechnischeRichtlinien/TR03124/TR-03124-1.pdf?__blob=publicationFile&v=1)
- [AusweisApp2 SDK Documentation](https://www.ausweisapp.bund.de/sdk/)
- [AusweisApp2 GitHub repository](https://github.com/Governikus/AusweisApp2)

**Usage with IE11:**

This library supports all modern browsers by default. To use this library in older browsers like _Internet Explorer 11_ you need to polyfill the `fetch` and the `Promise` Web-APIs. We recommend using [`whatwg-fetch`](https://npm.im/whatwg-fetch) and [`promise-polyfill`](https://npm.im/promise-polyfill).

## Limitations

- The **Safari** browser treats _localhost_ as mixed-content and therefore blocks fetch calls to it. Here, we have no way of detecting wether an eID client is installed and running.<sup id="a1">[1](#f1)</sup>
- The detection on mobile systems via the localhost server is not possible. Instead we are trying to guess, after the user clicks on a link to open the eID client, if the app really opened or not. This detection is highly dependent on the mobile browser used and might break in the future. A service provider should always use this information only as a hint and still provide a guided user experience (e.g. by showing a dialog to the user, asking if she has an eID client installed).

## API Reference

### `StationaryStatusObserver`

#### `StationaryStatusObserver()`

The `StationaryStatusObserver()` constructor creates and returns a new `StationaryStatusObserver` object.

**Syntax:**

```js
const observer = new StationaryStatusObserver(callback[, options]);
```

**Parameters:**

- `callback` - A function which is called when the status changes. The callback is called with the observer instance as the `this` value and receives one input parameter:

  - `status` - The new status object. See the [AusweisApp2Status](#ausweisapp2status) type for available properties.

- `options` (optional) - An object which customizes the behavior of the observer. You can provide any combination of the following options:

  | Option                         | Type      | Description                                                          |
  | :----------------------------- | :-------- | :------------------------------------------------------------------- |
  | `refreshInterval = 10000`      | `number`  | polling interval (set to 0 to disable, time in milliseconds)         |
  | `refreshWhenHidden = false`    | `boolean` | polling when the window is invisible (if refreshInterval is enabled) |
  | `refreshOnFocus = true`        | `boolean` | refresh when the window gets focused                                 |
  | `focusThrottleInterval = 5000` | `number`  | only refresh once during this time span (in milliseconds)            |

**Example:**

```js
const observer = new StationaryStatusObserver(
  (status) => {
    // ...
  },
  {
    refreshInterval: 10000,
    refreshOnFocus: true,
  }
);
```

#### `StationaryStatusObserver.observe()`

Start observing the status.

On mobile platforms it directly emits the `"unknown"` status and doesn't start any timers or adds event listeners.

**Syntax:**

```js
observer.observe();
```

This function takes no arguments and its return value is `void`.

#### `StationaryStatusObserver.unobserve()`

Stops observing the status.

Make sure to call this function, when the user navigates away from the
eID section on your page, to free resources and stop the timers.

**Syntax:**

```js
observer.unobserve();
```

This function takes no arguments and its return value is `void`.

#### `StationaryStatusObserver.refresh()`

Manually trigger a refresh of the current eID client status.

The callback function passed to the constructor on instance creation is only invoked if the new status is different from the last one. To get the current status use the `StationaryStatusObserver.status` getter.

**Syntax:**

```js
observer.refresh();
```

This function takes no arguments.

**Return value:**

The function returns a `Promise<void>`, that resolves, when the new status is determined.

#### `StationaryStatusObserver.status`

The `status` getter returns the last status observed by this observer instance.

**Syntax:**

```js
const status = observer.status;
```

**Return value:**

The getter returns either `null` if no status was observed, yet, or a status object of the [AusweisApp2Status](#ausweisapp2status) type.

### `getStationaryStatus()`

Retrieve the current status of the eID client on the host platform.
Only works on desktop environments, where the eID client starts a background http service.

**Syntax:**

```js
const status = await getStationaryStatus();
```

This function takes no arguments.

**Return value:**

The `getStationaryStatus` function returns a `Promise` that resolves with a status object of the [AusweisApp2Status](#ausweisapp2status) type.

**Notes:**

Works by trying to reach the status endpoint of the eID client as specified in
[TR-03124-1 eID-Client - Part 1: Specifications](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Publikationen/TechnischeRichtlinien/TR03124/TR-03124-1.pdf?__blob=publicationFile&v=1)

Some browsers (as of the time writing only Safari) block requests to localhost origins
due to mixed-content restrictions. This function returns the `"unknown"` status in this case.

eID clients don't start a background http server on mobile platforms.
The returned state is undefined in this case and one should check
the platform before using this function with the `isMobile` function. (The StationaryStatusObserver class has this check already built in and emits the `unknown` state in this case.)

### `observeEIDLink()`

Augments a HTML anchor element to provide feedback, if the user had an eID client installed and the identification process started or not.

**Syntax:**

```js
observeEIDLink(targetElement, callback);
```

**Parameters:**

- `targetElement` - reference to the target DOM anchor element.

- `callback` - A function, which is called after the user clicked the link and this library decided, that the click was unsuccessful and no app was installed. The callback receives no arguments and its return value is ignored.

**Return value:**

The return value is `undefined`.

**Example:**

```js
const btn = document.getElementById("eid_btn");
observeEIDLink(btn, () => {
  // show alert ...
});
```

### `getClientURL()`

The `getClientURL` function is a helper function to construct correct URLs to interact with the eID-client.

**Syntax:**

```js
const clientURL = getClientURL([options]);
```

**Parameters:**

- `options` (optional) - An object which customizes the returned URL.

  - `mobile` (optional) - common _boolean_ flag to switch between the [`ClientURLStationary` and `ClientURLMobile`](#clienturlstationary--clienturlmobile) base URLs. Uses [`isMobile`](#ismobile) as the default.

  - `action` (optional) - one of the following string values: `"status"`, `"connect"`, `"showui"`. Depending on the selected action there might be more options available.

    - `action = "connect"` - starts the identification procedure

      - `tcTokenURL` - a string pointing to your backend, used by the eID-client to fetch the tcToken necessary for starting an identification.

    - `action = "status"` - used to query status information from the eID-client

      - `json = false` (optional) - tell the eID-client to return the status response in json format.

    - `action = "showui"` - opens the UI of the eID-client

      - `module` (optional) - specify the UI module to open, possible values are `"PINManagement"` and `"Settings"`

**Return value:**

The function returns a `string` containing a valid eID client URL.

**Example:**

```js
const clientURL = getClientURL({
  action: "connect",
  tcTokenURL: "https://yourserver.com/api/eid/start",
});

// will return "http://127.0.0.1:24727/eID-Client?tcTokenURL=https%3A%2F%2Fyourserver.com%2Fapi%2Feid%2Fstart" on desktop
```

**Notes:**

For a better understanding of what an eID clientURL is see Section 2.2 in [TR-03124-1 eID-Client - Part 1: Specifications](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Publikationen/TechnischeRichtlinien/TR03124/TR-03124-1.pdf?__blob=publicationFile&v=1).

### `ClientURLStationary` / `ClientURLMobile`

The library exports two string constants representing the base URLs for the eID client URLs.

**Definition:**

```js
export const ClientURLStationary = "http://127.0.0.1:24727/eID-Client";
export const ClientURLMobile = "eid://127.0.0.1:24727/eID-Client";
```

**See:**

- [TR-03124-1 eID-Client - Part 1: Specifications](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Publikationen/TechnischeRichtlinien/TR03124/TR-03124-1.pdf?__blob=publicationFile&v=1), Section 2.2 Full eID-Client

### `isMobile()`

The `isMobile` function tries to guess, if the user is visiting the service on a mobile device.

It uses the Client Hints API and falls back to manual userAgent string parsing if not available.

**Syntax:**

```js
const mobile = isMobile();
```

This function takes no arguments.

**Return value:**

This function returns a `boolean` value:

- `true`, if the user is on a mobile device (SmartPhone or Tablet).
- `false` otherwise.

**Example:**

```js
if (isMobile()) {
  // Hurray!
} else {
  // E.g. use StationaryStatusObserver or
  // display QR-code for QR-Code flow.
}
```

### `AusweisApp2Status`

The type of the object returned by the [`getStationaryStatus`](#getstationarystatus) function and in the [`StationaryStatusObserver`](#stationarystatusobserver) callback.

| Property                        | Type               | Description                                          |
| :------------------------------ | :----------------- | :--------------------------------------------------- |
| `status`                        | `string`           | One of `"available"`, `"unavailable"` or `"unknown"` |
| `details`                       | `null` or `object` | Only not `null` if `status` equals `"available"`     |
| `details.implementationTitle`   | `string`           |
| `details.implementationVendor`  | `string`           |
| `details.implementationVersion` | `string`           |
| `details.name`                  | `string`           |
| `details.specificationTitle`    | `string`           |
| `details.specificationVendor`   | `string`           |
| `details.specificationVersion`  | `string`           |

## Footnotes

<b id="f1">1</b> Currently the detection doesn't work on Safari due to a [webkit bug](https://bugs.webkit.org/show_bug.cgi?id=171934). [↩](#a1)
