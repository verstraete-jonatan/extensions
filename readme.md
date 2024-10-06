## TODO

1:

- gets an error if the page is not yet logged in, see:
  https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-RunAt
  https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts

2:

- Does initial fetch from content.js as we can't really know if the projectId changed (if any)
- cookie won't be valid after x time, need to reset cookie.

  3:

- (not tested) if you would open a new tab with another projectId, this should overwrite the content of the popup with sub of the new project
- try using: chrome.runtime.connect for life long connection? performance? multi tab?

## FLOWS (with versions)

### FLow - V3 (current)

1. Popup Script (popup.js):

   - User clicks the "Refetch" button.
   - Sends a message (Messages.refetch) to the background script to trigger data fetching.
   - Listens for incoming data (Messages.updateUi) from the background script and updates the UI with the received data.

2. Background Script (background.js):

   - Receives the Messages.refetch request from the popup script.
   - Queries all open tabs with URLs matching 24/7 and forwards message from popup to content on a certain tab.
   - Sends a Messages.refetch message to the content script in all matching tabs to initiate data fetching.
     - we could listen on location in the content script and fetch the data if the location changes, but then this would be difficult to maintain with multiple tabs.
   - Receives data from the content script after the fetch and forwards it to the popup script via Messages.updateUi.

3. Content Script (content.js):
   - Receives the Messages.refetch message from the background script.
   - Fetches the subscription data from the app's API.
   - Sends the fetched data (Messages.updateUi) back to the background script.

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

### Help

Sending messages: https://stackoverflow.com/questions/9106519/port-error-could-not-establish-connection-receiving-end-does-not-exist-in-chr

see history for injecting script.
