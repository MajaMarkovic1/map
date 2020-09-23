import Vue from "vue";
import VueI18n from "vue-i18n";
import en from "../translations/en";
import de from "../translations/de";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: {en, de}
});

export default i18n;
