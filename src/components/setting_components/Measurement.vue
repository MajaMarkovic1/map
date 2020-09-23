<template>
<div class="measurement">
  <p class="id">{{measurement.id}}</p>
  <table>
    <tr>
      <td v-if="measurement.type === 'LineString'">{{$t("measureComponent.length")}}</td>
      <td v-else >{{$t("measureComponent.circumference")}}</td>
      <td>{{ length }}</td>
    </tr>
    <tr v-if="measurement.type !== 'LineString'">
      <td>{{$t("measureComponent.area")}}</td><td v-html="area"></td>
    </tr>
    <tr v-if="measurement.type === 'Circle'">
      <td>{{$t("measureComponent.radius")}}</td><td>{{ radius }}</td>
    </tr>
  </table>
  <button class="remove" @click="$emit('removeMeasurement')">
    <img src="../../assets/icons/close.png" alt="" />
  </button>
</div>
</template>

<script>
export default {
  name: "Measurement",
  props: ["measurement"],
  computed: {
    length: function () {
      return this.measurement.length > 1000
          ? `${(this.measurement.length / 1000).toFixed(2)} km`
          : `${this.measurement.length.toFixed(2)} m`;
    },

    area: function () {
      return this.measurement.area > 10000
          ? `${(this.measurement.area / 100000).toFixed(2)} km<sup>2</sup>`
          : `${this.measurement.area.toFixed(2)} m<sup>2</sup>`;
    },

    radius: function (){
      return `${this.measurement.radius.toFixed(2)} m`;
    }
  }
}
</script>

<style scoped>

</style>