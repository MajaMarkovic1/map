<template>
  <div id="single-pois">
    <button id="single-poi" @click="showSinglePOI()" @mouseover="mouseover" @mouseleave="mouseleave">
      <div v-if="item.cover || item.parent.image" class="single-poi-img">
        <img class="cover-img" :src="hostAddress + (item.cover || item.parent.image)" alt="" />
        <div class="is-opened-info" v-if="item.opening_hours" :class="{ opened: isOpened }">
          <img src="../../assets/icons/timer.png" alt="" />{{ isOpened ? $t("poiDetails.opened") : $t("poiDetails.closed") }}
        </div>
      </div>
      <div v-else class="single-poi-img"><img class="cover-img" src="/images/placeholder.png" alt="" /></div>
      <div class="single-poi-data">
        <p class="single-poi-name">{{ item.name }}</p>
        <p class="single-poi-address" v-if="item.address">
          {{ item.address[0] }}
        </p>
        <p class="single-poi-address" v-if="item.address">
          {{ item.address[1] }}
        </p>
        <div class="single-poi-category">
          <img class="single-poi-category-logo" :src="hostAddress + item.parent.logo" v-if="item.parent.logo" />
          <div class="single-poi-category-name">{{ item.parent.name }}</div>
        </div>
      </div>
    </button>
  </div>
</template>
<script>
import {categoryService} from "../../services/category";
import {basemap} from "../../services/map/basemap.js";
import {M2wApi} from "@/services/m2w_api";

export default {
  name: "PoiTocCard",
  data() {
    return {
      hostAddress: M2wApi.host_address
    };
  },
  props: {
    item: Object
  },
  computed: {
    isOpened: function() {
      return categoryService.checkIfOpened(this.item, true);
    }
  },

  methods: {
    showSinglePOI() {
      this.$router.push({name: "poiDetails", params: {id: this.item.id}, query: {parent: this.item.parent.id}});
    },
    mouseover() {
      basemap.setCircleMarkerStyle(this.item);
    },
    mouseleave() {
      basemap.deleteOverlayMarker(this.item);
    }
  }
};
</script>
