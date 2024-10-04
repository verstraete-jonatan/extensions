(() => {
  // note: these const's should match in mother files
  const Messages = {
    refetch: "PleaseRefetchData",
    updatedData: "UpdatedDataFromHost",
    updateUi: "UpdateExtensionWithNewData",
  };

  const btnRefresh = document.getElementById("refetchButton");
  const content = document.getElementById("content");
  let preventSpamming = false;

  btnRefresh?.addEventListener("click", () => {
    if (!preventSpamming) {
      preventSpamming = true;
      chrome.runtime.sendMessage({ type: Messages.refetch });
      setTimeout(() => (preventSpamming = false), 5 * 1000);
    }
  });

  const renderContent = (items) => {
    if (!content) {
      document.body.innerHTML = "no content...";
    }
    if (!Array.isArray(items)) {
      content.innerHTML = `<div class="error"> ${JSON.stringify(items)} </div>`;
    }

    content.innerHTML = "";
    for (const sub of items) {
      content.innerHTML += `<div class="list-item"> ${sub.Name || "-"} </div>`;
    }
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("@popup.js  ", { message, sender, sendResponse });

    if (message.type === Messages.updateUi) {
      renderContent(message.data);
    }
  });
})();
