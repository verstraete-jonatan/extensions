(() => {
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
    let data = null;
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Missing properties for fetch");
      }

      //   await new Promise((r) => setTimeout(r, 5000));

      const projects = (await fetchAllProjects()) || [];

      await Promise.all(
        projects.map((project) =>
          fetchSubsByProject(project.ID).then((subs) => (project.subs = subs))
        )
      );

      if (!Array.isArray(projects)) {
        throw new Error("data has incorrect format");
      }
      data = projects.filter(({ subs }) => subs.length);
    } catch (error) {
      console.log("ERROR", error);
      data = error.message;
    }
    chrome.runtime.sendMessage({
      type: Messages.updateData,
      data,
      for: "background",
    });
  };

  /**
   * ::: Messaging :::
   */

  chrome.runtime.sendMessage({
    type: Messages.content_active,
    for: "background",
  });

  // message from background.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.info("Message:", message);

    if (message.for !== "content") {
      return;
    }

    if (message.type === Messages.refetch) {
      //   console.log("Should fetch", new Date().toISOString());
      fetchSubscriptions();
    }
  });
})();
