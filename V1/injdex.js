/** Due to cors  (aka. SOAP)  we can't send request from the extension itself so need to inject a script into the host orm which we can emit the response back to the extension */

(async () => {
  try {
    const response = await fetch("https://yourapp.com/api/subscriptions", {
      method: "GET",
      credentials: "include", // Ensures cookies (including auth tokens) are sent
    });

    const data = await response.json();

    // Send data back to the Chrome extension
    window.postMessage({ type: "FROM_PAGE", data: data }, "*");
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
  }
})();
