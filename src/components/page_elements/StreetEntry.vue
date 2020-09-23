<template>
  <button class="street item" :class="{active: active}">
    <div>{{ street.name }}</div>
    <Dropdown
        v-if="active"
        :options="houseNumbers"
        :selected="hnr"
        :placeholder="$t('streetEntry.num')"
        :kex="'id'"
        :view="'hnr'"
        @selected="chooseHnr"
    />
  </button>
</template>

<script>
import {basemap} from "@/services/map/basemap";
import {M2wApi} from "@/services/m2w_api";
import Dropdown from "./Dropdown";

export default {
  name: "StreetEntry",
  components: {Dropdown},
  props: ["street", "active"],
  data() {
    return {
      houseNumbers: [],
      activeLine: null,
      activeMarker: null,
      hnr: null
    };
  },
  watch: {
    active: async function () {
      await this.onActiveFunc()
    },

    "$route.query.hnr": function () {
      this.hnrFromQuery();
    }
  },

  async mounted() {
    await this.onActiveFunc();
    this.hnrFromQuery();
  },
  async activated() {
    await this.onActiveFunc();
    this.hnrFromQuery();
  },
  deactivated() {
    this.cleanup();
  },
  destroyed(){
    this.cleanup();
  },

  methods: {
    hnrFromQuery() {
      if (this.activeMarker)
        basemap.map.removeLayer(this.activeMarker);

      if (!this.active)
        return;

      let hnr = this.$route.query.hnr;
      let num = this.houseNumbers.find(x => x.hnr === hnr);
      if (!num)
        return;

      this.hnr = num;
      this.activeMarker = basemap.createMarkerForCoordinates(num.geom.coordinates);
      basemap.map.getView().animate({
        center: num.geom.coordinates,
        duration: 200
      });
    },

    async onActiveFunc() {
      if (this.activeLine)
        basemap.map.removeLayer(this.activeLine);

      if (!this.active)
        return;

      this.activeLine = basemap.drawLine(this.street.geom);
      let extent = this.activeLine.getSource().getExtent();
      basemap.map.getView().fit(extent, {duration: 1000});

      // fetch HNRs if necessary
      if (this.houseNumbers.length === 0) {
        this.houseNumbers = (await M2wApi.get_single_street(this.street.id)).house_numbers;
      }

      this.$el.scrollIntoView({block: "nearest"});
    },

    async chooseHnr(num_obj) {
      await this.$router.push({query: {...this.$route.query, "hnr": num_obj.hnr}});
    },

    cleanup(){
      if (this.activeMarker)
        basemap.map.removeLayer(this.activeMarker);
      if (this.activeLine)
        basemap.map.removeLayer(this.activeLine);
    }
  }
};
</script>

<style scoped></style>
