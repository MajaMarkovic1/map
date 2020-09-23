<template>
  <div id="direction-recommended">
    <button class="direction-type wrapper" @click="showDrivingSteps()">
      <div class="direction-icon"><img src="../../assets/icons/car.png" alt="" /></div>
      <div class="direction-option-description">
        <div class="time">43 Min.</div>
        <div class="direction details">über Linke Wienzeile; A1</div>
        <div class="direction details best">schnellste Route</div>
      </div>
      <div class="direction distance">62,5 km</div>
    </button>
    <button class="direction-type wrapper" @click="showDrivingSteps()">
      <div class="direction-icon"><img src="../../assets/icons/bus.png" alt="" /></div>
      <div class="direction-option-description">
        <div class="time">1 Std. 17 Min.</div>
        <div class="direction-suboptions">
          <div><img src="../../assets/icons/bus.png" alt="" /> <label>13A</label></div>
          <div><img src="../../assets/icons/train.png" alt="" /> <label>RJ</label></div>
          <div><img src="../../assets/icons/train.png" alt="" /> <label>R</label></div>
        </div>
        <div class="direction details">Abfahrt 14:24 Pilgramgasse</div>
      </div>
      <div class="direction distance"></div>
    </button>
    <button class="direction-type wrapper" @click="showDrivingSteps()">
      <div class="direction-icon"><img src="../../assets/icons/car.png" alt="" /></div>
      <div class="direction-option-description">
        <div class="time">1 Std. 8 Min.</div>
        <div class="direction details">über Linke Wienzeile; A1</div>
        <div class="direction details">4 Min. Verzogerung</div>
      </div>
      <div class="direction distance">71,0 km</div>
    </button>
    <button class="direction-type wrapper" @click="showDrivingSteps()">
      <div class="direction-icon"><img src="../../assets/icons/bike.png" alt="" /></div>
      <div class="direction-option-description">
        <div class="time">4 Std. 16 Min.</div>
        <div class="direction details">über B1</div>
      </div>
      <div class="direction distance">81,1 km</div>
    </button>
  </div>
</template>
<script>
export default {
  data() {
    return {

    }
  },
  methods: {
    showDrivingSteps() {
      this.$emit("showDrivingSteps")
    }
  }
};
</script>
