<template>
  <div id="direction-options">
    <div class="direction-options icons" v-if="!activeRoute">
      <button
        v-for="(option, key) in options"
        :key="key"
        :class="{active: key === activeOption}"
        @click="toggleDirectionOption(key)"
      >
        <img :src="require('../../assets/icons/' + option + '.png')" alt="" />
      </button>
    </div>
    <div id="direction-summary" v-if="!activeRoute">
      <button v-for="(route, i) in routes" :key="i"
              class="direction-type wrapper" @click="chooseRoute(route)"
              @mouseover="spotlight(route)"
              @mouseleave="fadeout(route)"
      >
        <div class="direction-icon"><img :src="getIconForRoute(route)" alt="" /></div>
        <div class="direction-option-description">
          <div class="first-row">
            <div class="time">{{route.legs[0].duration.text}}</div>
            <div class="distance">{{route.legs[0].distance.text}}</div>
          </div>
          <div class="summary" v-if="route.summary">{{$t("routeFrame.via") + " " + route.summary }}</div>
          <div class="direction-suboptions" v-if="!route.summary">
            <div v-for="(step, i) in route.legs[0].steps" :key="i">
              <img v-if="!step.transit" :src="require('../../assets/icons/walk.png')" alt="" />
              <img v-if="step.transit" :src="step.transit.line.vehicle.icon" />
              <label v-if="step.transit" >{{step.transit.trip_short_name || step.transit.line.short_name || step.transit.line.agencies[0].name}}</label>
            </div>
          </div>
          <div v-if="!route.summary" class="summary">{{$t("routeFrame.departure")}}
            {{route.legs[0].departure_time.text}} {{route.legs[0].departure_location}}</div>
        </div>
      </button>
    </div>
    <DirectionsPersonal v-if="activeRoute && activeRoute.summary" :route="activeRoute" @goback="goBack()"/>
    <DirectionsPublic v-if="activeRoute && !activeRoute.summary" :route="activeRoute" @goback="goBack()"/>
  </div>
</template>
<script>

import {basemap} from "@/services/map/basemap";
import DirectionsPersonal from "./DirectionsPersonal";
import DirectionsPublic from "./DirectionsPublic";

export default {
  components: {DirectionsPersonal, DirectionsPublic},
  props: ['routes'],
  data() {
    return {
      activeOption: "DRIVING",
      options: {
        "DRIVING": "car",
        "TRANSIT": "bus",
        "BICYCLING": "bike",
        "WALKING": "walk"
      },
      activeRoute: null,
      inactiveStyle: {color: "rgba(150, 150, 150, 1)", width: 5},
      activeStyle: {color: "rgba(150, 250, 120, 1)", width: 5}
    };
  },

  watch:{
    "routes": function(newRoutes, oldRoutes){
      this.activeRoute = null;
      if(oldRoutes){
        for(let route of oldRoutes) {
          basemap.map.removeLayer(route.line);
        }
        basemap.map.removeLayer(this.waypoints);
      }
      this.drawLines();
    },
    "$route.params.route_from": function(){
      this.updateFromTo();
    },
    "$route.params.route_to": function(){
      this.updateFromTo();
    }
  },

  mounted() {
    this.drawLines();
    this.updateFromTo();
  },

  beforeDestroy() {
    if(this.routes){
      for(let route of this.routes) {
        basemap.map.removeLayer(route.line);
      }
      basemap.map.removeLayer(this.waypoints);
    }
  },

  methods: {
    drawLines(){
      this.routes.forEach((value, i) => {
        let layer = basemap.drawEpsg4326Line(value.overview_path,
            i === 0 ? this.activeStyle : this.inactiveStyle);
        if(i === 0){
          layer.setZIndex(1);
        }
        value.line = layer;
      });
      // calculate waypoint markers ...
      let wp = [this.routes[0].legs[0].start_location, this.routes[0].legs[0].end_location];
      this.waypoints = basemap.drawEpsg4326Circle(wp, 5);
      basemap.zoomToExtent(this.routes.map(r => r.line.getSource().getExtent()));
    },

    getIconForRoute(route) {
      // find longest step, return that icon
      let sortedSteps = [...route.legs[0].steps].sort((s1, s2) => s2.distance.value - s1.distance.value);
      let longestStep = sortedSteps[0];
      return require('../../assets/icons/'+this.options[longestStep.travel_mode]+'.png');
    },

    toggleDirectionOption(type) {
      this.activeOption = type;

      // remove old lines:
      for(let route of this.routes) {
        basemap.map.removeLayer(route.line);
      }

      this.$emit('changeDrivingMode', type);
    },

    spotlight(route) {
      basemap.updateStyle(route.line, this.activeStyle);
      route.line.setZIndex(1);
    },
    fadeout(route){
      basemap.updateStyle(route.line, this.inactiveStyle);
      route.line.setZIndex(0);
    },

    chooseRoute(route) {
      this.activeRoute = route;
      this.routes.filter(r => r !== route).forEach(r => r.line.setVisible(false));
    },

    goBack(){
      this.activeRoute = null;
      this.routes.forEach(r => r.line.setVisible(true));
    },

    updateFromTo() {

    }
  }
};
</script>
