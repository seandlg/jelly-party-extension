import { browser } from "webextension-polyfill-ts";
import { userNames } from "@/helpers/userNames";
import { sample as _sample } from "lodash-es";
import uuidv4 from "@/helpers/uuidv4";
import { OptionsState } from "@/apps/sidebar/Vue-IFrame/store/options/types";

browser.runtime.onInstalled.addListener(function() {
  console.log("browser.runtime.onInstalled called");
  const options = { guid: uuidv4(), clientName: _sample(userNames) };
  browser.storage.local.set({ options: options }).then(function() {
    console.log("Jelly-Party has been initialized.");
    console.log(options);
  });
});

function resetGUIDIfLost() {
  browser.storage.local.get("options").then(res => {
    const options: OptionsState = res.options;
    if (!options.guid) {
      console.log("Jelly-Party. GUID lost, resetting GUID.");
      const newOptions = { ...options, ...{ guid: uuidv4() } };
      browser.storage.local.set({ options: newOptions });
    }
  });
}

function redirectToParty(
  redirectURL: string,
  resolve: (arg0?: any) => void,
  reject: (arg0?: any) => void,
) {
  // We attempt to inject the content script several times. If we've been
  // successful, further injections will yield no effect.
  // The root of the problem lies in the fact that browser.tabs.update's
  // callback function sometimes seems to execute before the tab's DOM content
  // has been loaded. This leads to the content script sometimes disappearing
  // into a void inbetween join.jelly-party.com and redirectURL.
  browser.tabs
    .update(undefined, { url: redirectURL })
    .then(async tab => {
      const activeTabId = tab.id;
      const delays = [3000, 5000, 10000];
      delays.forEach(delay => {
        setTimeout(() => {
          console.log("Jelly-Party: Attempting script injection.");
          browser.tabs
            .executeScript(activeTabId, {
              file: "js/sidebar.js",
            })
            .then(() => {
              resolve("Jelly-Party: Redirection to party successful.");
            })
            .catch(err => {
              if (delay === delays.splice(-1)[0]) {
                reject("Jelly-Party: Redirection to party failed.");
              } else {
                console.log(
                  `Could not redirect to party. Will attempt redirection again in ${delay}.`,
                );
                console.log(err);
              }
            });
        }, delay);
      });
    })
    .catch(e => console.log(e));
}

export interface RedirectFrame {
  type: "redirectToParty";
  payload: {
    redirectURL: string;
  };
}

browser.runtime.onMessage.addListener((req: string) => {
  const request: any = JSON.parse(req);
  switch (request.type) {
    case "redirectToParty": {
      return new Promise((resolve, reject) => {
        redirectToParty(
          (request as RedirectFrame).payload.redirectURL,
          resolve,
          reject,
        );
      });
    }
    case "setOptions": {
      browser.storage.local.set({ options: request.options });
      resetGUIDIfLost();
      break;
    }
    default: {
      console.log(`Jelly-Party: Received unknown message: ${request}`);
    }
  }
});
