<template>
  <div>
    <div id="lhs_wrapper">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
    <div id="store-links">
      <img class="logo-img" :src="hostAddress + project.logo" alt="">
      <button v-if="project.cityapp" class="downl-img" @click="goToPlayStore()"><img src="../assets/icons/robot.png" alt=""></button>
      <button v-if="project.cityapp" class="downl-img" @click="goToIStore()"><img src="../assets/icons/apple.png" alt=""></button>
    </div>
    <div id="company-links">
      <img class="company-logo" src="../assets/icons/page_logo.png" alt="">
      <a class="company-website" target="_blank" href="https://www.schubert-franzke.com">(C) Schubert & Franzke</a>
      <a class="impressum-link" target="_blank" href="https://www.schubert-franzke.com/at/impressum">{{$t("settings.dataPrivacy")}}</a>
      <router-link class="legend-link" to="/legend" v-if="sfBasemap">{{$t("settings.legend")}}</router-link>
    </div>

    <SettingButtonsComponent />
    <div id="map" @contextmenu.prevent="$refs.menu.open" @contextmenu="setCoordinates($event)"></div>
    <vue-context ref="menu">
      <li @click.prevent="setStartpoint()">
        <img src="../assets/icons/marker.png" alt="" />
        <a>{{ $t("rightClickFrame.startPoint")}}</a>
      </li>
      <li @click.prevent="setEndpoint()">
        <img src="../assets/icons/marker.png" alt="" />
        <a>{{ $t("rightClickFrame.endPoint")}}</a>
      </li>
      <li @click.prevent="getNearestPoi()">
        <img src="../assets/icons/location.png" alt="" />
        <a>{{ $t("rightClickFrame.whatIsHere")}}</a>
      </li>
      <li @click.prevent="print()">
        <img src="../assets/icons/print.png" alt="" />
        <a>{{ $t("rightClickFrame.print")}}</a>
      </li>
      <li @click.prevent="$router.push({name:'measure'})">
        <img src="../assets/icons/measure.png" alt="" />
        <a>{{ $t("rightClickFrame.measure")}}</a>
      </li>
    </vue-context>
  </div>
</template>

<script>
import Vue from "vue";
import VueContext from "vue-context";
import "vue-context/src/sass/vue-context.scss";
import {basemap} from "@/services/map/basemap";
import SettingButtonsComponent from "./button_controls/SettingButtons";
import {M2wApi} from "@/services/m2w_api";

export default {
  name: "MapComponent",
  components: {VueContext, SettingButtonsComponent},
  data() {
    return {
      map: {},
      coordinates: {},
      category: {},
      hostAddress: M2wApi.host_address,
      sfBasemap: Vue.config.project.sf_basemap,
      project: Vue.config.project
    };
  },
  async mounted() {
    // browser language over project chosen default:
    const languages = Vue.config.project.languages;
    const browserLanguage = navigator.language.substring(0, 2);
    let defaultLanguage = languages.find(x => x.abbreviation === browserLanguage);
    if (!defaultLanguage) defaultLanguage = languages.find(x => x.is_default);
    this.$i18n.locale = defaultLanguage.abbreviation.toLowerCase();

    // if we know coords, init basemap with them
    await basemap.initMap();

    // restore location from URL
    this.fetchLocationUrl();
    window.addEventListener("popstate", this.fetchLocationUrl);
    basemap.map.on("moveend", this.updatePermalink);
  },

  methods: {

    print() {
      basemap.print();
    },

    setCoordinates(event) {
      this.coordinates = basemap.map.getEventCoordinate(event);
    },

    async getNearestPoi() {
      let closest = await M2wApi.get_closest_poi(this.coordinates, this.$i18n.locale);
      if (closest.obj) {
        await this.$router.push({name: "poiDetails", params: {id: closest.obj}});
      }
      else if(closest.address){
        this.$router.push({name:"pois", params:{view:"streets"}, query: {
          str_id: closest.address.id, hnr: closest.address.house_number.hnr }});
      }
    },

    setStartpoint() {
      basemap.createMarkerForCoordinates(this.coordinates);
    },

    setEndpoint() {
      basemap.createMarkerForCoordinates(this.coordinates);
    },

    updatePermalink() {
      if (!this.shouldUpdate) {
        // do not update the URL when the view was changed in the 'popstate' handler
        this.shouldUpdate = true;
        return;
      }
      const view = basemap.map.getView();
      const center = view.getCenter();
      const serialized = center[0] + "," + center[1] + "," + view.getZoom();

      // only push on actual location change, relevant when navigating back
      if (this.$route.query.location !== serialized)
        this.$router.replace({query: {...this.$route.query, location: serialized}});
    },

    fetchLocationUrl() {
      const locationString = this.$route.query.location;
      let center;
      let zoom;
      if (!locationString) return;

      let locationStringRegex = /^([-0-9.]+),([-0-9.]+),([0-9.]+)$/;
      let matches = locationString.match(locationStringRegex);
      if (matches) {
        center = [parseFloat(matches[1]), parseFloat(matches[2])];
        zoom = parseFloat(matches[3]);

        const view = basemap.map.getView();

        view.setCenter(center);
        view.setZoom(zoom);
        this.map = basemap.map;
      }
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
