import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./services/i18n";
import vueDebounce from "vue-debounce";
import {M2wApi} from "@/services/m2w_api";
import {basemap} from "@/services/map/basemap";

M2wApi.get_project_info()
  .then(response => {
    Vue.config.project = response;
    if(response.sf_basemap)
      return basemap.getWmtsLayer(Vue.config.project.sf_basemap);
    return Promise.resolve(null);
  })
  .then(response => {
    if(response)
      Vue.config.project.sf_basemap.layer = response;

    Vue.config.productionTip = false;
    Vue.use(vueDebounce);
    let app = new Vue({
      i18n,
      router,
      store,
      render: h => h(App)
    });

    app.$mount("#app");
  });

