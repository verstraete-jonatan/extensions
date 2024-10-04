// I'm the middle man between the background and the extension

(() => {
  const APP_URL = "https://master-dev.bricsys247.com";

  // note: these const's should match in mother files
  const Messages = {
    refetch: "PleaseRefetchData",
    updatedData: "UpdatedDataFromHost",
    updateUi: "UpdateExtensionWithNewData",
  };

  //   if (window.scriptInjected || !window?.location.href.startsWith(APP_URL)) {
  //     console.log("already init");
  //     return;
  //   } else {
  //     window.scriptInjected = true;
  //   }

  chrome.runtime.sendMessage({
    type: "test",
    data: 1,
  });

  const log = (...a) => {
    console.log(...a);
    chrome.extension.getBackgroundPage().console.log(...a);
  };

  log(1, window?.location.href);

  const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${COOKIE_ACCESS_TOKEN}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const getProjectId = () =>
    window.location.href.split("/project/")[1]?.match(/^([^\/]*)/)?.[1];

  // Fetch subscriptions
  async function fetchSubscriptions() {
    const token = getToken();
    const projectId = getProjectId();

    if (!token || !projectId) {
      log("NAND", { token, projectId });
      return;
    }

    try {
      const data = await fetch(
        `https://master-dev.bricsys247.com/api/rest/FolderSubscription?p=${projectId}&expand=FOLDER`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            authorization: `Bearer ${token}`,
          },
          // referrer:"https://master-dev.bricsys247.com/app/project/622/folder/31620",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );

      chrome.runtime.sendMessage({
        type: Messages.updateUi,
        data,
      });

      log("Send Data", data);
    } catch (error) {
      log("RROR Data", error);
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(
      "ONmesage",
      { request, sender, sendResponse },
      window.location.origin
    );

    if (request.type === Messages.refetch) {
      fetchSubscriptions();
    }
  });
})();
