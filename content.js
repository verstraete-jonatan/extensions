// I'm the middle man between the background and the extension

(() => {
  const APP_URL = "https://master-dev.bricsys247.com";

  // note: these const's should match in mother files
  const Messages = {
    refetch: "PleaseRefetchData",
    updatedData: "UpdatedDataFromHost",
    updateExtension: "UpdateExtensionWithNewData",
  };

  let hasSend = false;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(
      "ONmesage",
      { request, sender, sendResponse },
      window.location.origin
    );
    if (hasSend) return;
    hasSend = true;
    // forward message from popup.js to background.js
    chrome.runtime.sendMessage({
      type: request.type,
      data: null,
    });
  });
})();
