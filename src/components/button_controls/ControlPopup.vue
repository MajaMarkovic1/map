<template>
  <div id="control-popup" :class="className" v-if="currentName">
    <div id="header">
      <img class="logo-img" :src="logoAddress" alt="">
      <div class="settings-label">{{ $t(currentTabComponent) }}</div>
      <button class="close-button" @click="closeFrame()">
        <img src="../../assets/icons/close.png" alt="" />
      </button>
    </div>
    <div class="control-content">
        <component :is="currentTabComponent" @measure="$emit('measure')"></component>
    </div>
    <div class="download-wrapper">
      <div><img src="../../assets/icons/page_logo.png" alt=""></div>
      <div class="download-text">{{ $t("settings.downloadMsg")}}</div>
      <button v-if="project.cityapp" class="downl-img" @click="goToPlayStore()"><img src="../../assets/icons/robot.png" alt=""></button>
      <button v-if="project.cityapp" class="downl-img" @click="goToIStore()"><img src="../../assets/icons/apple.png" alt=""></button>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { M2wApi } from '../../services/m2w_api';
import LayersControl from "./LayersControl";
import SettingsControl from "./SettingsControl";

export default {
  name: "ControlPopup",
  components: {LayersControl, SettingsControl},
  data() {
    return {
      isSettingsPopup: false,
      project: Vue.config.project
    };
  },
  props: {
    currentName: String
  },
  computed: {
    currentTabComponent: function() {
      if (this.currentName) return this.currentName + "Control";
      return null;
    },
    className: function() {
      if (this.isSettingsPopup){
        return "settings"
      }
      return "layers"
    },
    logoAddress() {
      return M2wApi.host_address + Vue.config.project.logo
    }
  },
  updated() {
    if (this.currentName == "Settings") {
      this.isSettingsPopup = true;
      console.log(this.isSettingsPopup)
    } else {
      this.isSettingsPopup = false;
    }
  },
  methods: {
    closeFrame() {
      this.$emit("closeFrame");
    },
    goToPlayStore() {
      window.location.href = Vue.config.project.cityapp.play_store_url
      
    },
    goToIStore() {
       window.location.href = Vue.config.project.cityapp.app_store_url

    }
  }
};
</script>
