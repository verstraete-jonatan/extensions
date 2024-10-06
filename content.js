(() => {
  "use strict";

  console.log(
    "%cLive %s",
    "font: 50px sans-serif; font-weight:bold; color: transparent; -webkit-text-stroke:3px #fdbb2d; background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);",
    "247!"
  );

  /**
   * ::: Helpers :::
   */
  const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${COOKIE_TOKEN}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const fetchWithToken = (url) =>
    fetch(url, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${getToken()}`,
      },
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }).then(async (stream) => {
      const json = await stream.json();
      return json.Items;
    });

  const fetchAllProjects = () =>
    fetchWithToken(
      "https://master-dev.bricsys247.com/api/rest/Project?shortformat=true"
    ).then((projects) => projects.filter((p) => p.Size));

  const fetchSubsByProject = (projectId) =>
    fetchWithToken(
      `https://master-dev.bricsys247.com/api/rest/FolderSubscription?p=${projectId}&expand=FOLDER`
    );

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Missing properties for fetch");
      }

      const projects = (await fetchAllProjects()) || [];

      await Promise.all(
        projects.map((project) =>
          fetchSubsByProject(project.ID).then((subs) => (project.subs = subs))
        )
      );

      if (!Array.isArray(projects)) {
        throw new Error("data has incorrect format");
      }

      //   console.log("sending...", [...projects]);

      chrome.runtime.sendMessage({
        type: Messages.updateUi,
        data: projects.filter(({ subs }) => subs.length),
      });
    } catch (error) {
      console.log("ERROR", error);
      chrome.runtime.sendMessage({
        type: Messages.updateUi,
        data: error.message,
      });
    }
  };

  /**
   * ::: Messaging :::
   */

  chrome.runtime.sendMessage({
    type: Messages.contentActive,
  });

  // message from background.js
  chrome.runtime.onMessage.addListener((request) => {
    // console.info("Message:", request.type);
    if (request.type === Messages.refetch) {
      //   console.log("Should fetch", new Date().toISOString());
      fetchSubscriptions();
    }
  });
})();
