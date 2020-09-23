<template>
  <div id="directions-frame">
    <div class="search-box">
      <button class="btn lhs"><img src="../../assets/icons/menu.png" alt="" /></button>
      <img class="line-icon" src="../../assets/icons/line.png" alt="" />
      <input id="route_point_0" :placeholder="$t('routeFrame.startPoint')" />
      <button class="btn rhs" @click="closeDirectionsFrame"><img src="../../assets/icons/close.png" alt="" /></button>
      <img class="line-icon right" src="../../assets/icons/line.png" alt="" />
    </div>
    <div class="interleave">
      <button @click="addWaypointAt(1)">+</button>
      <img class="line" src="../../assets/icons/line-long.png" alt="" />
      <button @click="reversePoints(0)"><img src="../../assets/icons/reverse.png" alt="" /></button>
    </div>
    <div  v-for="num in (wayPoints - 2)" :key="num">
      <div class="search-box">
        <button class="btn lhs" style="visibility: hidden"/>
        <input :id="'route_point_' + num" :placeholder="$t('routeFrame.midPoint')" />
        <button class="btn rhs" style="visibility: hidden"/>
      </div>
      <div class="interleave">
        <button @click="addWaypointAt(num+1)">+</button>
        <img class="line" src="../../assets/icons/line-long.png" alt="" />
        <button @click="reversePoints(num)"><img src="../../assets/icons/reverse.png" alt="" /></button>
      </div>

    </div>
    <div class="search-box">
      <button class="settings-icon btn lhs" :class="{active: showOptions}" @click="toggleRouteOptions()">
        <img src="../../assets/icons/settings-dark.png" alt="" />
      </button>
      <input
          :id="'route_point_' + (wayPoints-1)"
          :placeholder="$t('routeFrame.endPoint')" />
      <button class="btn rhs" @click="fetchRoute"><img src="../../assets/icons/bus.png" alt="" /></button>
    </div>
    <RouteOptions v-if="showOptions" :options="routeOptions" />
    <DirectionDisplay v-if="routes.length" :routes="routes" @changeDrivingMode="changeMode"/>
  </div>
</template>
<script>
import RouteOptions from "./RouteOptions";
import DirectionDisplay from "./DirectionDisplay";
import Vue from "vue";
import {getTransform} from "ol/proj"

export default {
  components: {RouteOptions, DirectionDisplay},
  data() {
    return {
      showOptions: false,
      routeOptions: {
        highways: true,
        ferries: true,
        tolls: true,
        units: "metric",
        mode: "DRIVING"
      },
      routes: [],
      wayPoints: 2,
      directionsService: null,
      bounds: null
    };
  },

  mounted() {
    const gm = window.google.maps;
    this.directionsService = new gm.DirectionsService();
    let transform = getTransform('EPSG:3857', 'EPSG:4326');
    let coord = transform(Vue.config.project.center);
    this.bounds = new gm.LatLngBounds(new gm.LatLng(coord[1], coord[0]));

    this.setupAutocomplete("route_point_0");
    this.setupAutocomplete("route_point_1");
  },

  methods: {
    toggleRouteOptions() {
      this.showOptions = !this.showOptions;
    },

    reversePoints(index) {
      // 3-way-switch the form inputs
      let elem1 = document.getElementById("route_point_" + index);
      let elem2 = document.getElementById("route_point_" + (index + 1));
      let tmp2 = elem1.value;
      elem1.value = elem2.value;
      elem2.value = tmp2;
    },

    addWaypointAt(index) {
      this.wayPoints++;

      Vue.nextTick(() => {
        for (let i = this.wayPoints-2; i >= index; i--) {
          let elem = document.getElementById("route_point_" + i);
          let next = document.getElementById("route_point_" + (i-1));
          elem.value = next.value;
          this.setupAutocomplete("route_point_" + (i));
        }
        document.getElementById("route_point_" + index).value = "";
        this.setupAutocomplete("route_point_" + index);
      });
    },

    closeDirectionsFrame() {
      this.$router.back();
    },

    setupAutocomplete(input_id) {
      const gm = window.google.maps.places;
      let elem = document.getElementById(input_id);
      let ac = new gm.Autocomplete(elem);
      ac.setBounds(this.bounds);
    },

    async fetchRoute() {
      let request = {
        origin: document.getElementById("route_point_0").value,
        destination: document.getElementById("route_point_" + (this.wayPoints - 1)).value,
        travelMode: this.routeOptions.mode,
        avoidFerries: !this.routeOptions.ferries,
        avoidHighways: !this.routeOptions.highways,
        avoidTolls: !this.routeOptions.tolls,
        unitSystem: this.routeOptions.units === "metric" ?
            window.google.maps.UnitSystem.METRIC : window.google.maps.UnitSystem.IMPERIAL,
        provideRouteAlternatives: true
      }

      let apiPromise = new Promise(resolve => {
        this.directionsService.route(request, (response) => resolve(response));
      });

      let response = await apiPromise;
      this.routes = response.routes;
    },

    async changeMode(mode){
      this.routeOptions.mode = mode;
      await this.fetchRoute();
    }
}

};
</script>
