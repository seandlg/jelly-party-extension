import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import { RootState } from "./types";
import { options } from "./options/index";
import { party } from "./party/index";
// @ts-ignore
import { getField, updateField } from "vuex-map-fields";
// import { browser } from "webextension-polyfill-ts";

Vue.config.devtools = ["development", "staging"].includes(
  process.env.NODE_ENV ?? "",
);
Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    sideBarMinimized: false,
    connectedToServer: false,
    connectingToServer: false,
    appTitle: process.env.VUE_APP_TITLE ?? "appTitle",
    appMode: process.env.VUE_APP_MODE ?? "appMode",
  },
  modules: {
    options,
    party,
  },
  getters: {
    getField,
  },
  mutations: {
    toggleSideBar(state) {
      state.sideBarMinimized = !state.sideBarMinimized;
    },
    setConnectingToServer(state, bool: boolean) {
      state.connectingToServer = bool;
    },
    setConnectedToServer(state, bool: boolean) {
      state.connectedToServer = bool;
    },
    updateField,
  },
  actions: {
    toggleSideBar(context) {
      context.commit("toggleSideBar");
    },
    setConnectingToServer(context, bool: boolean) {
      context.commit("setConnectingToServer", bool);
    },
    setConnectedToServer(context, bool: boolean) {
      context.commit("setConnectedToServer", bool);
    },
  },
};

export default new Vuex.Store<RootState>(store);
