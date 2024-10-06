import {
  Messages,
  APP_URL,
  COOKIE_TOKEN,
  ChromeStorage,
} from "./const/consts.mjs";
let lastTimeFetched = null;

// TODO: add some interval on date check
const canRefetch = () => lastTimeFetched === null;

const hasAuthCookie = () =>
  new Promise((resolve) =>
    chrome.cookies.get({ url: `${APP_URL}/*`, name: COOKIE_TOKEN }, (cookie) =>
      resolve(!!cookie?.value?.startsWith("ey"))
    )
  );

const emitRefetch = async (tabId = 0) => {
  const isAuthenticated = await hasAuthCookie();
  // TODO:
  // needs auth cookie to have been set
  if (!isAuthenticated || !tabId || !canRefetch()) {
    return;
  }
  console.info("Send initial refetch", tabId, new Date().toISOString());
  chrome.tabs.sendMessage(tabId, { type: Messages.refetch, for: "content" });
  lastTimeFetched = Date.now();
};

// hello world mesage in console of extsion
chrome.runtime.onInstalled.addListener(() => {
  const css =
    "font: 50px sans-serif; font-weight:bold; color: transparent; -webkit-text-stroke:3px #fdbb2d; background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);";
  console.log("%c24/7 %s", css, "Is live!");
});

// Listen for any messages (content.js and popup.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("@background.js", { ...message, sender });

  if (message.for !== "background") {
    return;
  }

  try {
    switch (message.type) {
      case Messages.updateData:
        ChromeStorage.set(message.data);
      // will forward the data to popup.js
      // chrome.runtime.sendMessage({
      //   type: Messages.updateData,
      //   data: message.data,
      //   for: "popup",
      // });

      case Messages.refetch:
        // forward message (from popup.js) to first 247 tab (to content.js)
        // TODO: (perforamnce) put these tabds in an array and muate array based on changes
        chrome.tabs.query({ url: `${APP_URL}/*` }, (tabs) => {
          if (tabs[0]) {
            // TODO:::::: ###### FIIIIXXX MMEEEEE
            // when reseting the enable fetch, this creates an infiite loop of fetching... how??
            // lastTimeFetched = null;
            emitRefetch(tabs[0].id);
          }
        });
      case Messages.content_active:
        // will be triggered by page reload and execute a refetch if none already happended
        // when no fetch has been executed yet, this will compete with the timeout below
        // note: this will only work when the page is active ofc.
        if (sender.url?.includes("#state=") && canRefetch()) {
          emitRefetch(sender.tab.id);
        }
    }
  } catch (error) {
    console.warn("Error:", error);
  }
});

// TODO: this is only needed for when we want to check if project-id has changes.
// currently not needed
// watches for any tab update
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // console.log("onupdate", { changeInfo, tab });
  if (
    // TODO: check for a certain time interval and reset
    !lastTimeFetched &&
    changeInfo.status === "complete" &&
    // check url
    tab.url?.startsWith(APP_URL) &&
    // check url is not in auth state
    !tab.url.includes("#state=")
  ) {
    // content.js is not yet injected. Need to wait for page load.
    setTimeout(() => {
      canRefetch() && emitRefetch(tabId);
    }, 5000);
  }
});
