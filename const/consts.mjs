const APP_URL = "https://master-dev.bricsys247.com";
const COOKIE_TOKEN = "access_token";

// note: these const's should match in other files
const Messages = {
  refetch: "PleaseRefetchData",
  updatedData: "UpdatedDataFromHost",
  updateUi: "UpdateExtensionWithNewData",
  contentActive: "HiImActive!",
  emitTabId: "HellooowThisIsYourTabId",
};

for (const k in Messages) {
  Messages[k] = "__EX_SUBS__" + Messages[k];
}

export { Messages, APP_URL, COOKIE_TOKEN };
