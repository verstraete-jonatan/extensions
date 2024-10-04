## TODO

- background.js does not catch messages from injected.js
- only works for 1 tab with 1 projectId (is an issue?)

### Help

Sending messages: https://stackoverflow.com/questions/9106519/port-error-could-not-establish-connection-receiving-end-does-not-exist-in-chr

## FLOW

### FLow - V2

- `injected.js`: is injected into the app.
  - This fetches data on receiving a message from the extension and emits this data globally for all tabs.
- `background.js`: this listens to all messages from all tabs.
  - if any new 247 tab is opened, it injects the `injected.js` into it.
  - if it receives data (from the `injected.js`) it send this to the `popup.js`
  - watches for message from popup.js to manually retrigger the data
- `popup.js`: watches for messages from the `background.js` and handles the UI of the extension rending the data (if any)
  - can also manually trigger a refetch of the data emitting this message to the `background.js`

### FLow - V1

1. script is injected in 247 (to omit cors/soap) to fetch the data
   - after fetch/refetch it emits the data using `window.postMessage`
   - we can listen on this message in the extension using `chrome.runtime.onMessage`.
2. The `contentScript` has 3 functions:

   - injects the `inject.js` script into all active tabs and ensures to unject into any new tab of 247.
   - listens for messages from the injected script.
     - on receives data, it forwards it to the `background.js` script
   - also listens to event form the `popup.js` to manually refetch the data.
   - so is basically the middleman between the injected script and the extension popup.

3. `background.js` listens to the contentScript and forwards it again to the popup-script which render the data (if any).
   - background script is the only script which can listen to messages form all tabs.
   - The background script can listen to messages from all tabs, facilitating communication across the extension.
