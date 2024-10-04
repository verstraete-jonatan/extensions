(() => {
  const APP_URL = "https://master-dev.bricsys247.com";
  const COOKIE_ACCESS_TOKEN = "access_token";

  return;

  if (window.scriptInjected || !window?.location.href.startsWith(APP_URL)) {
    console.log("already init");
    return;
  } else {
    window.scriptInjected = true;
  }

  // note: these const's should match in mother files
  const Messages = {
    refetch: "PleaseRefetchData",
    updatedData: "UpdatedDataFromHost",
    updateUi: "UpdateExtensionWithNewData",
  };

  // TEST POST mechanism
  window.postMessage(
    {
      type: "TEST",
      test: 1,
    },
    "*"
  );

  const getCookie = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${COOKIE_ACCESS_TOKEN}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const getProjectIdFormUrl = () =>
    window.location.href.split("/project/")[1]?.match(/^([^\/]*)/)?.[1];

  // Fetch subscriptions
  async function fetchSubscriptions(token, projectId) {
    const response = await fetch(
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

    console.log({ response });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to fetch subscriptions");
    }
  }

  window.addEventListener("message", async (event) => {
    console.log(event?.data);
    // Perform the fetch again when a refetch is requested
    if (event.data.type !== Messages.refetch) {
      return;
    }

    const token = getCookie();
    const projectId = getProjectIdFormUrl();
    let subscriptions = [];

    if (token && projectId) {
      try {
        const response = await fetchSubscriptions(token, projectId);
        console.log({ response });
        subscriptions = response.data;
      } catch (error) {
        console.error("Error refetching subscriptions:", error);
      }
    }
    // emit data to 'background.js'
    window.postMessage(
      {
        type: Messages.updatedData,
        data: {
          token,
          projectId,
          subscriptions,
        },
        // url: window.location.href,
      },
      "*"
    );
  });
})();
