(() => {
  const btnRefresh = document.getElementById("refetchButton");
  const btnClear = document.getElementById("resetButton");
  const htmlContent = document.getElementById("content");

  let preventSpamming = false;

  const renderContent = async () => {
    const data = await ChromeStorage.get();
    if (!htmlContent) {
      document.body.innerHTML += "Uups 404?";
      return;
    }
    if (!data) {
      htmlContent.innerHTML = `<p>No content</p>`;
      return;
    }
    if (!Array.isArray(data)) {
      htmlContent.innerHTML = `<p> Error: ${JSON.stringify(data)}</p>`;
      return;
    }

    htmlContent.innerHTML =
      "<p> Last updated: " + new Date().toISOString() + "</p>";
    for (const project of data) {
      htmlContent.innerHTML += `<h3>${project.Name}</h3>`;
      htmlContent.innerHTML += `<ul>`;
      for (const sub of project.subs) {
        htmlContent.innerHTML += `<li> ${sub.Name || "-"} </li>`;
      }
      htmlContent.innerHTML += `</ul>`;
    }
  };

  btnRefresh?.addEventListener("click", () => {
    if (!preventSpamming) {
      preventSpamming = true;
      chrome.runtime.sendMessage({
        type: Messages.refetch,
        for: "background",
      });
      setTimeout(() => (preventSpamming = false), 5 * 1000);
    }
  });

  btnClear?.addEventListener("click", () => {
    ChromeStorage.clear();
    renderContent();
  });

  // watches for all messages (content.js & background.js)
  // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //   console.log("@popup.js  ", { ...message });

  //   if (message.for !== "popup") {
  //     return;
  //   }

  //   switch (message.type) {
  //     case Messages.updateData:
  //       storage.set(message.data).then(renderContent);
  //   }
  // });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log("has changes");
    if (areaName === "local" && changes[ChromeStorage.key]) {
      renderContent();
    }
  });

  console.log("Hey! I'm a popup :DD");

  // init, show UI based on stored data
  renderContent();
})();
