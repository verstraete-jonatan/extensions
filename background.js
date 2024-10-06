"use strict";

import { Messages, APP_URL, COOKIE_TOKEN } from "./const/consts.mjs";
let lastTimeFetched = null;

const hasAuthCookie = () =>
  new Promise((resolve) =>
    chrome.cookies.get({ url: `${APP_URL}/*`, name: COOKIE_TOKEN }, (cookie) =>
      resolve(!!cookie?.value?.startsWith("ey"))
    )
  );

const emitRefetch = async (tabId = 0) => {
  const isAuthenticated = await hasAuthCookie();
  // needs auth cookie to have been set
  if (!isAuthenticated && tabId) {
    return;
  }
  console.info("Send initial refetch", tabId, new Date().toISOString());
  chrome.tabs.sendMessage(tabId, { type: Messages.refetch });
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
  console.log("@background.js", { ...message });

  switch (message.type) {
    case Messages.refetch:
      // forward message (from popup.js) to first 247 tab (to content.js)
      chrome.tabs.query({ url: `${APP_URL}/*` }, (tabs) => {
        if (tabs[0]) {
          emitRefetch(tabs[0].id);
        }
      });
    case Messages.contentActive:
      // will be triggered by page reload adn execute a refetch if none already happended
      // when no fetch has been executed yet, this will compete with the timeout below
      //
      if (sender.tab.url?.includes("#state=") && !lastTimeFetched) {
        emitRefetch(sender.tab.id);
      }
  }
});

// watches for any tab update
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // console.log("onupdate", { changeInfo, tab, State });

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
      !lastTimeFetched && emitRefetch(tabId);
    }, 5000);
  }
});
