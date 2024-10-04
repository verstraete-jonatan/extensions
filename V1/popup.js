document.addEventListener("DOMContentLoaded", async () => {
  const subscriptionsDiv = document.getElementById("subscriptions");

  chrome.runtime.sendMessage({ action: "getSubscriptions" }, (response) => {
    if (response.success) {
      const subscriptions = response.subscriptions;
      subscriptionsDiv.innerHTML = ""; // Clear current subscriptions
      subscriptions.forEach((sub) => {
        const subElement = document.createElement("div");
        subElement.className = "subscription";
        subElement.innerHTML = `<strong>${sub.name}</strong><br> ${sub.details}`;
        subscriptionsDiv.appendChild(subElement);
      });
    } else {
      subscriptionsDiv.innerHTML = `<p>Error: ${response.error}</p>`;
    }
  });
});
