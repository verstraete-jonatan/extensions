import { Messages, APP_URL, COOKIE_TOKEN } from "./const/consts.mjs";

const State = {
  initialprojectId: null,
  lastTimeFetched: null,
};

const getProjectId = (url) =>
  url.split("/project/")[1]?.match(/^([^\/]*)/)?.[1];

const getAuthCookie = () =>
  chrome.cookies.get(
    { url: `${APP_URL}/*`, name: COOKIE_TOKEN },
    (cookie) => cookie?.value
  );

// hello world mesage in console of extsion
chrome.runtime.onInstalled.addListener(() => {
  const css =
    "font: 50px sans-serif; font-weight:bold; color: transparent; -webkit-text-stroke:3px #fdbb2d; background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);";
  console.log("%c24/7 %s", css, "Is live!");
});

// Listen for any messages (content.js and popup.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("@background.js", { ...message });

  // forward message (from popup.js) to a 247 tab, aka. the content.js
  if (message.type === Messages.refetch) {
    chrome.tabs.query({ url: `${APP_URL}/*` }, (tabs) => {
      const firstTab = tabs[0];
      if (firstTab) {
        chrome.tabs.sendMessage(firstTab.id, { type: Messages.refetch });
      }
    });
  }
});

// checks if projectId changes from initla check
// executes an initla
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.log("onupdate", { changeInfo, tab, State });

  if (tab.url?.startsWith(APP_URL)) {
    console.info(
      "log:",
      changeInfo.status === "complete",
      tab.url?.startsWith(APP_URL),
      !tab.url.includes("#state="),
      getAuthCookie()?.startsWith("ey")
    );
  }

  if (
    changeInfo.status === "complete" &&
    // check url
    tab.url?.startsWith(APP_URL) &&
    // check url is not in auth state
    !tab.url.includes("#state=") &&
    // page needs to have auth cookie on page set
    getAuthCookie()?.startsWith("ey")
  ) {
    // check if page url has a project id
    const projectId = getProjectId(tab.url);
    if (!projectId) {
      State.initialprojectId = null;
      return;
    }
    if (State.initialprojectId !== projectId) {
      setTimeout(
        () => {
          console.info("Send initial refetch", tabId, new Date().toISOString());
          chrome.tabs.sendMessage(tabId, { type: Messages.refetch });
          // content.js is not yet injected. Need to wait for page load.
        },
        State.initialprojectId ? 0 : 5000
      );
      State.initialprojectId = projectId;
    }
  }
});
