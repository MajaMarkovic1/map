<template>
  <div id="measure-popup">
    <div class="measure title">
      <label class="measure label">{{ $t("measureComponent.measure") }}</label>
      <button class="close-button" @click="$router.push({name:'default'})">
        <img src="../../assets/icons/close.png" alt="" />
      </button>
    </div>

    <div class="measure options">
      <div class="forms">
        <label class="label">{{ $t("measureComponent.shape") }}</label>
        <div class="forms-list">
          <button :class="{active: type === 'LineString'}" @click="chooseForm('LineString')">
            <img src="../../assets/icons/polyline.png" alt="" />
          </button>
          <button :class="{active: type === 'Circle'}" @click="chooseForm('Circle')">
            <img src="../../assets/icons/circle.png" alt="" />
          </button>
          <button :class="{active: type === 'Box'}" @click="chooseForm('Box')">
            <img src="../../assets/icons/rectangular.png" alt="" />
          </button>
          <button :class="{active: type === 'Polygon'}" @click="chooseForm('Polygon')">
            <img src="../../assets/icons/polygon.png" alt="" />
          </button>
        </div>
      </div>
      <div class="measure color">
        <div class="label">{{ $t("measureComponent.colorSelector") }}</div>
        <input type="color" id="favcolor" name="favcolor" v-model="color" value="#ff0000" />
      </div>
    </div>
    <div class="measurements">
      <Measurement v-for="measurement in measurements" :key="measurement.id" :measurement="measurement" @removeMeasurement="remove(measurement)"/>
    </div>

    <button v-if="measurements.length" class="close btn" @click="deleteAll()">{{$t("measureComponent.delete")}}</button>
  </div>
</template>
<script>
import {basemap} from "@/services/map/basemap";
import Measurement from "@/components/setting_components/Measurement";

export default {
  components: {Measurement},
  data() {
    return {
      color: "#ff0000",
      selected: "",
      type: "",
      currentMeasurement: null,
      measurements: [],
      counter: 1
    };
  },
  deactivated() {
    this.deleteAll();
  },
  destroyed() {
    this.deleteAll();
  },
  computed: {
    isArea() {
      let areaTypes = ["Polygon", "Box", "Circle"];
      return areaTypes.includes(this.type);
    },
    isCircle() {
      return this.type === "Circle";
    }
  },
  methods: {
    chooseForm(type) {
      this.type = type;
      if(this.currentMeasurement){
        this.currentMeasurement.cancel();
        const index = this.measurements.indexOf(this.currentMeasurement);
        this.measurements.splice(index, 1);
        this.counter--;
      }

      let drawing = basemap.startMeasurement(type, this.color, this.counter++);
      drawing.onFinish = () => this.currentMeasurement = null;
      this.currentMeasurement = drawing;
      this.measurements.push(drawing);
    },

    deleteAll() {
      this.measurements.forEach(m => m.remove());
      this.measurements = [];
      this.counter = 1;
    },

    remove(measurement) {
      measurement.remove();
      const index = this.measurements.indexOf(measurement);
      this.measurements.splice(index, 1);
    }
  }
};
</script>
