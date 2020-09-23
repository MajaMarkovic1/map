<template>
  <div id="direction-steps">

    <button @click="$emit('goback')">
      <img src="../../assets/icons/arrow.png" alt="">
      <div>
        <div>{{ route.legs[0].start_address }}</div>
        <div>{{ route.legs[0].end_address }}</div>
      </div>
    </button>
    <div class="steps-wrapper">
      <div class="step" v-for="(step, i) in route.legs[0].steps" :key="i">
        <div class="summary">
          <div class="direction-icon"><img :src="getIconForStep(step)" alt=""/></div>
          <div class="step-data">
            <div class="step-description" v-html="step.instructions"></div>
            <div class="time-and-distance">
              <div>{{ step.distance.text }}</div>
              <div>{{ step.duration.text }}</div>
            </div>
          </div>
        </div>
        <div class="step-details" v-if="step.steps" >
          <button @click="toggleDetails(step)">{{$t("routeFrame.details")}}</button>
          <div v-show="step.showDetails" >
            <div class="detail" v-for="(inner_step, j) in step.steps" :key="j">
              <div class="step-description" v-html="inner_step.instructions"></div>
              <div class="time-and-distance">
                <div>{{ inner_step.distance.text }}</div>
                <div>{{ inner_step.duration.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";

export default {
  props: ['route'],
  methods: {
    getIconForStep(step) {
      if (step.travel_mode === "WALKING")
        return require("../../assets/icons/walk.png");

      return step.transit.line.vehicle.icon;
    },

    toggleDetails(step) {
      Vue.set(step, 'showDetails', !step.showDetails);
    }

  }
}
</script>
