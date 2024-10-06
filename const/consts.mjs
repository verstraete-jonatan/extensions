const APP_URL = "https://master-dev.bricsys247.com";
const COOKIE_TOKEN = "access_token";

// note: these const's should match in other files
// note: never send a message type that you are watching on
const Messages = {
  refetch: "PleaseRefetchDataMrContent",
  updateData: "SendingUpdatedData",
  content_active: "HiImContentAnImActive!",
};

for (const k in Messages) {
  Messages[k] = "__EX_SUBS__" + Messages[k];
}

const ChromeStorage = {
  key: "some-very-unique-key-for-storage",
  data: null,
  get() {
    return new Promise((resolve) =>
      chrome.storage.local.get(this.key, (allStorage) => {
        const data = allStorage[this.key];
        if (data) {
          this.data = data;
        }
        resolve(data);
      })
    );
  },
  set(data) {
    this.data = data;
    return new Promise((resolve) =>
      chrome.storage.local.set({ [this.key]: data }, () => resolve(null))
    );
  },
  clear() {
    chrome.storage.local.set({ [this.key]: null });
  },
};

export { Messages, APP_URL, COOKIE_TOKEN, ChromeStorage };
