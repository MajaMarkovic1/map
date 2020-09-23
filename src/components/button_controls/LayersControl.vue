<template>
  <div class="layers-wrapper">
    <button
      :class="{active: activeLayer === layer.id}"
      v-for="layer in allLayers"
      :key="layer.id"
      @click="changeLayer(layer.id)"
    >
      <div class="button-inner">
        <img :src="hostAddress + layer.image_url" :alt="layer.name" />
        <div>
          <div class="layer-name">{{ layer.name }}</div>
        </div>
      </div>
    </button>
  </div>
</template>
<script>
import {basemap} from "../../services/map/basemap";
import {M2wApi} from "../../services/m2w_api";

export default {
  name: "LayersControl",
  data() {
    return {
      allLayers: basemap.allLayers,
      hostAddress: M2wApi.host_address,
      activeLayer: basemap.activeLayer
    };
  },
  methods: {
    async changeLayer(layerId) {
      await basemap.changeBasemap(layerId);
      this.activeLayer = layerId;
    }
  }
};
</script>
