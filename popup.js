(() => {
  // note: these const's should match in mother files
  const Messages = {
    refetch: "PleaseRefetchData",
    updatedData: "UpdatedDataFromHost",
    updateUi: "UpdateExtensionWithNewData",
  };

  const log = (...a) => {
    console.log(...a);
    chrome.extension.getBackgroundPage().console.log(...a);
  };

  log("oi");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log("@popup - ", { message, sender, sendResponse });

    if (document.getElementById("content")) {
      document.getElementById("content").innerText = JSON.stringify(message);
    }

    if (message.type === Messages.updateUi) {
      const updatedData = message.data;
      log("Data received in popup:", updatedData);

      if (document.getElementById("content")) {
        document.getElementById("content").innerText =
          JSON.stringify(updatedData);
      }
      // Update the popup UI with the received data
      // Example: document.getElementById('dataDisplay').innerText = JSON.stringify(updatedData);
    }
  });

  console.log(document.getElementById("refetchButton"));

  // Trigger refetch on button click
  document
    .getElementById("refetchButton")
    ?.addEventListener("click", async () => {
      chrome.runtime.sendMessage({ type: Messages.refetch });
    });
})();
