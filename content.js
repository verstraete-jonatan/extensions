// I'm the middle man between the background and the extension

(() => {
  const APP_URL = "https://master-dev.bricsys247.com";
  const COOKIE_ACCESS_TOKEN = "access_token";

  // note: these const's should match in mother files
  const Messages = {
    refetch: "PleaseRefetchData",
    updatedData: "UpdatedDataFromHost",
    updateUi: "UpdateExtensionWithNewData",
  };

  chrome.runtime.sendMessage({
    type: "test",
    data: 1,
  });

  const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${COOKIE_ACCESS_TOKEN}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const getProjectId = () =>
    window.location.href.split("/project/")[1]?.match(/^([^\/]*)/)?.[1];

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const token = getToken();
      const projectId = getProjectId();

      if (!token || !projectId) {
        throw new Error("Missing properties for fetch");
      }

      const items = await fetch(
        `https://master-dev.bricsys247.com/api/rest/FolderSubscription?p=${projectId}&expand=FOLDER`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            authorization: `Bearer ${token}`,
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      ).then(async (stream) => {
        const json = await stream.json();
        return json.Items;
      });
      if (!Array.isArray(items)) {
        throw new Error("data has incorrect format");
      }

      chrome.runtime.sendMessage({
        type: Messages.updateUi,
        data: items,
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: Messages.updateUi,
        data: {
          error,
        },
      });
    }
  };

  //  message from popup.js
  chrome.runtime.onMessage.addListener((request, ...m) => {
    console.log("@content.js", request, ...m);
    if (request.type === Messages.refetch) {
      fetchSubscriptions();
    }
  });
})();
