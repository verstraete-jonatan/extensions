chrome.runtime.sendMessage({ action: "getSubscriptions" }, (response) => {
  if (response.success) {
    const subscriptions = response.subscriptions;

    // Create a floating panel to show subscriptions
    const panel = document.createElement("div");
    panel.style.position = "fixed";
    panel.style.bottom = "0";
    panel.style.right = "0";
    panel.style.background = "white";
    panel.style.border = "1px solid black";
    panel.style.padding = "10px";
    panel.style.zIndex = "1000";
    panel.style.width = "200px";
    panel.innerHTML = `<h4>Subscriptions</h4>`;

    subscriptions.forEach((sub) => {
      const subElement = document.createElement("div");
      subElement.style.marginBottom = "5px";
      subElement.innerHTML = `<strong>${sub.name}</strong>`;
      panel.appendChild(subElement);
    });

    document.body.appendChild(panel);
  }
});
