<template>
  <div id="direction-steps">

    <button @click="$emit('goback')">
      <img src="../../assets/icons/arrow.png" alt="">
      <div class="fromTo">
        <div>{{ route.legs[0].start_address }}</div>
        <div>{{ route.legs[0].end_address }}</div>
      </div>
    </button>
    <div class="direction-option">
      <div class="option-description">
        <div class="direction-icon"><img src="../../assets/icons/car.png" alt=""/></div>
        <div class="direction-option-description">
          <div class="time">{{ route.legs[0].duration.text }}</div>
          <div class="summary">{{ $t("routeFrame.via") + " " + route.summary }}</div>
        </div>
        <div class="distance">{{ route.legs[0].distance.text }}</div>
      </div>
      <!--<div class="direction-links">
          <button><img src="../../assets/icons/phone.png" alt=""></button>
          <button><img src="../../assets/icons/share.png" alt=""></button>
          <button><img src="../../assets/icons/print.png" alt=""></button>
      </div>-->
    </div>
    <div class="steps-wrapper">
      <div class="step" v-for="(step, i) in route.legs[0].steps" :key="i">
        <div class="summary">
          <div class="direction-icon"><img :src="getIconForManeuver(step)" alt=""/></div>
          <div class="step-data">
            <div class="step-description" v-html="step.instructions"></div>
            <div class="time-and-distance">
              <div>{{ step.distance.text }}</div>
              <div>{{ step.duration.text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ['route'],
  methods: {
    getIconForManeuver(step) {
      if (step.maneuver.indexOf("right") >= 0)
        return require("../../assets/icons/turn-right.png");
      if (step.maneuver.indexOf("left") >= 0)
        return require("../../assets/icons/turn-right.png");
      return require("../../assets/icons/straight.png");
    }
  }
}
</script>
