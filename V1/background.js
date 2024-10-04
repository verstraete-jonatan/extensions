(() => {
  // don't allow global variable in global scope

  const APP_URL = "https://master-dev.bricsys247.com";
  const COOKIE_TOKEN = "access_token";

  const State = {
    token: null,
    projectId: null,
    lastFetched: null,
  };

  chrome.runtime.onInstalled.addListener(() => {
    const css =
      "font: 100px sans-serif; font-weight:bold; color:#6ceb23; -webkit-text-stroke:3px #db4739";

    console.log("%c24/7 %s", css, "Is live!");
  });

  const getAuthToken = () =>
    new Promise((resolve, reject) => {
      chrome.cookies.get({ url: APP_URL, name: COOKIE_TOKEN }, (cookie) => {
        if (cookie) {
          resolve(cookie.value);
        } else {
          reject("No auth token found");
        }
      });
    });

  // Fetch subscriptions
  async function fetchSubscriptions() {
    if (!State.projectId || !State.token) {
      return;
    }

    const response = await fetch(
      "https://master-dev.bricsys247.com/api/rest/FolderSubscription?p=622&expand=FOLDER",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${State.token}`,
        },
        referrer:
          "https://master-dev.bricsys247.com/app/project/622/folder/31620",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );

    console.log({ response });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to fetch subscriptions");
    }
  }

  // Listen for messages from popup or content script
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.action === "getSubscriptions") {
        try {
          State.token = await getAuthToken();
          const subscriptions = await fetchSubscriptions();
          sendResponse({ success: true, subscriptions });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        return true; // Keep the message channel open for async responses
      }
    }
  );

  // Watch for changes in URL to detect if the project has changed.
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.startsWith(APP_URL)) {
      const id = tab.url.split("/project/")[1]?.match(/^([^\/]*)/)?.[1];
      const previd = State.projectId;
      State.projectId = id;

      if (id !== undefined && id !== previd) {
        fetchSubscriptions();
      }
    }
  });
})();
