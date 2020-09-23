<template>
  <div id="street-directory">
    <StreetEntry
      v-for="street in streets"
      v-bind:key="street.id"
      v-bind:street="street"
      v-bind:active="chosenStr === street.id"
      @click.native="chooseStreet(street.id)"
    ></StreetEntry>
  </div>
</template>
<script>
import {M2wApi} from "@/services/m2w_api";
import StreetEntry from "../page_elements/StreetEntry";

export default {
  name: "StreetDirectoryFrame",
  components: {StreetEntry},
  data() {
    return {
      streets: [],
      chosenStr: 0,
      chosenHnr: 0
    };
  },
  watch: {
    "$route.query.str_id": function(str_id) {
      this.chosenStr = str_id;
    }
  },
  async activated() {
    let streetObject = await M2wApi.get_streets();
    this.streets = streetObject.streets;
    this.chosenStr = parseInt(this.$route.query.str_id, 10);
  },
  methods: {
    chooseStreet(street) {
      // click on street again to hide it
      if (this.chosenStr === street) {
        this.$router.push({name: "pois", params: {view: "streets"}, query: {str_id: 0}});
      } else {
        this.$router.push({name: "pois", params: {view: "streets"}, query: {str_id: street}});
      }
    }
  }
};
</script>
