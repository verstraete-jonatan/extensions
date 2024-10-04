(() => {
  const APP_URL = "https://master-dev.bricsys247.com";

  // note: these const's should match in mother files
  const Messages = {
    refetch: "PleaseRefetchData",
    updatedData: "UpdatedDataFromHost",
    updateUi: "UpdateExtensionWithNewData",
  };

  // hello world mesage in console of extsion
  chrome.runtime.onInstalled.addListener(() => {
    const css =
      "font: 50px sans-serif; font-weight:bold; color: transparent; -webkit-text-stroke:3px #fdbb2d; background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);";
    console.log("%c24/7 %s", css, "Is live!");
  });

  // Inject injected.js into all new tabs
  // chrome.tabs.onCreated.addListener((tab) => {
  //   const url = tab.url || tab.pendingUrl;

  //   if (url?.startsWith(APP_URL)) {
  //     chrome.scripting.executeScript({
  //       target: {
  //         tabId: tab.id,
  //         // include to inject in child frames, eg: iFrame
  //         // allFrames: true
  //       },
  //       files: ["injected.js"],
  //     });
  //   }
  // });

  // Inject injected.js into all new tabs on every url change
  // need to checkin injected.js if the script was already injected.
  // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //   if (
  //     changeInfo.status === "complete" &&
  //     tab.url?.startsWith(APP_URL) &&
  //     !tab.url.includes("/#state=")
  //   ) {
  //     chrome.scripting.executeScript({
  //       target: { tabId, allFrames: true },
  //       files: ["injected.js"],
  //     });
  //   }
  // });

  // chrome.runtime.onMessageExternal.addListener(
  //   (request, sender, sendResponse) => {
  //     console.log("Received message from " + sender + ": ", request);
  //     sendResponse({ received: true }); //respond however you like
  //   }
  // );

  let d = false;
  // Listen for messages from injected scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("@background - ", { message, sender, sendResponse });
    if (d) {
      return;
    }

    // // message from injected: Forward data to popup
    // if (message.type === Messages.updatedData) {
    //   d = true;
    //   chrome.runtime.sendMessage({
    //     type: Messages.updateUi,
    //     data: message.data,
    //   });
    // }

    // message from popup/extension: send refetch to injected
    if (message.type === Messages.refetch) {
      d = true;
      chrome.tabs.query({ url: `${APP_URL}/*` }, (tabs) => {
        const firstTabid = tabs[0]?.id;
        console.log({ firstTabid });
        if (firstTabid) {
          chrome.tabs.sendMessage(firstTabid, { type: Messages.refetch });
        }
      });
    }
  });
})();
