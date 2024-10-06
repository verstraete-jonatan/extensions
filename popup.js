(() => {
  const btnRefresh = document.getElementById("refetchButton");
  const content = document.getElementById("content");
  let preventSpamming = false;

  const renderContent = (data) => {
    if (!content || !data) {
      document.body.innerHTML = "no content...";
    }
    if (!Array.isArray(data)) {
      content.innerHTML = `<div class="error"> ${JSON.stringify(data)} </div>`;
    }

    content.innerHTML =
      "<p> Last updated: " + new Date().toISOString() + "</p>";
    for (const project of data) {
      content.innerHTML += `<h1>${project.Name}</h1>`;
      content.innerHTML += `<ul>`;
      for (const sub of project.subs) {
        content.innerHTML += `<li> ${sub.Name || "-"} </li>`;
      }
      content.innerHTML += `</ul>`;
    }
  };

  btnRefresh?.addEventListener("click", () => {
    if (!preventSpamming) {
      preventSpamming = true;
      chrome.runtime.sendMessage({ type: Messages.refetch });
      setTimeout(() => (preventSpamming = false), 5 * 1000);
    }
  });

  // watches for all messages (content.js & background.js)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("@popup.js  ", { ...message });

    if (message.type === Messages.updateUi) {
      renderContent(message.data);
    }
  });
})();
