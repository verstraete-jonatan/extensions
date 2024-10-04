(() => {
  // note: these const's should match in mother files
  const Messages = {
    refetch: "PleaseRefetchData",
    updatedData: "UpdatedDataFromHost",
    updateExtension: "UpdateExtensionWithNewData",
  };

  console.log("oi");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("@popup - ", { message, sender, sendResponse });

    if (document.getElementById("content")) {
      document.getElementById("content").innerText = JSON.stringify(message);
    }

    if (message.type === Messages.updateExtension) {
      const updatedData = message.data;
      console.log("Data received in popup:", updatedData);
      // Update the popup UI with the received data
      // Example: document.getElementById('dataDisplay').innerText = JSON.stringify(updatedData);
    }
  });

  // Trigger refetch on button click
  document.getElementById("refetchButton")?.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: Messages.refetch });
  });
})();
