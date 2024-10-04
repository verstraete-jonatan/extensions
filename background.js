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

  let d = false;
  // Listen for messages from injected scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("@background.js", { message, sender, sendResponse });
    if (d) {
      return;
    }

    // message from popup/extension: send refetch
    if (message.type === Messages.refetch) {
      d = true;
      chrome.tabs.query({ url: `${APP_URL}/*` }, (tabs) => {
        const firstTabid = tabs[0]?.id;
        if (firstTabid) {
          chrome.tabs.sendMessage(firstTabid, { type: Messages.refetch });
        }
      });
    }
  });
})();
