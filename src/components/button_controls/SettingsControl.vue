<template>
  <div class="locale-changer">
    <div class="title-layer">{{ $t("settings.layerLabel") }}</div>
    <div class="layers">
      <LayerControl />
    </div>
    <div class="language">
      <div class="title">{{ $t("settings.language.title") }}</div>
      <select v-model="$i18n.locale" class="lng select">
        <option v-for="lang in languages" :key="lang.abbreviation" :value="lang.abbreviation">{{
          $t("settings.language." + lang.name)
        }}</option>
      </select>
    </div>
    <div class="functions">
      <div class="title">{{ $t("settings.functions.title") }}</div>
      <div class="functions icons">
        <button class="function btn" @click="print()"><img src="../../assets/icons/print.png" alt="" /></button>
        <div class="title">{{ $t("settings.functions.print") }}</div>
        <button class="function btn" @click="$router.push({name:'measure'})">
          <img src="../../assets/icons/measure.png" alt="" />
        </button>
        <div class="title">{{ $t("settings.functions.measure") }}</div>
      </div>
    </div>
    <div class="impressum">
      <div>(C) Schubert & Franzke {{date.getYear() + 1900}}</div>
      <div>|</div>
      <a href="https://www.schubert-franzke.com/at/impressum">{{ $t("settings.dataPrivacy")}}</a>
    </div>
  
  </div>
</template>

<script>
import Vue from "vue";
import {basemap} from "../../services/map/basemap";
import LayerControl  from "./LayersControl"
export default {
  name: "SettingsControl",
  components: {LayerControl},
  data() {
    return {
      languages: Vue.config.project.languages,
      date: new Date()
    };
  },
  methods: {
    print() {
      let settings_frame = document.getElementsByClassName("settings")[0];
      settings_frame.style.display = "none";
      basemap.print();
      settings_frame.style.display = "block";
    }
  }
};
</script>
