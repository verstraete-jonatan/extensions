(() => {
  const css =
    "font: 50px sans-serif; font-weight:bold; color: transparent; -webkit-text-stroke:3px #fdbb2d; background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);";
  console.log("%cLive %s", css, "247!");

  const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${COOKIE_TOKEN}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const getProjectId = () =>
    window.location.href.split("/project/")[1]?.match(/^([^\/]*)/)?.[1];

  chrome.runtime.sendMessage({
    type: Messages.contentActive,
    data: null,
  });

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

  // message from background.js
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === Messages.refetch) {
      console.log("Should fetch", new Date().toISOString());
      fetchSubscriptions();
    }
  });
})();
