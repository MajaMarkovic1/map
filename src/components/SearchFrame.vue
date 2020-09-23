<template>
  <div id="search-frame">
    <div class="no-results txt" v-if="isLoading">{{ $t("searchFrame.loading") }} ...</div>
    <div class="no-results txt" v-if="hasError">{{ $t("searchFrame.error") }}</div>
    <div class="no-results txt" v-if="noResults">{{ $t("searchFrame.noResults") }}</div>

    <div v-if="!noResults">
      <div class="search category" v-for="poi in searchResults.pois" :key="poi.id">
        <button
          class="search category wrapper"
          :class="{active: chosenPoi === poi}"
          @click="choosePoi(poi)"
          @mouseover="mouseover(poi)"
          @mouseleave="mouseleave(poi)"
        >
          <img class="search category logo" :src="host_address + poi.logo" alt="" />
          <div>
            <div class="search category name">{{ poi.name }}</div>
            <div class="search category address" v-if="poi.address">{{ poi.address[0] }}, {{ poi.address[1] }}</div>
          </div>
        </button>
      </div>
      <StreetEntry
        v-for="street in searchResults.streets"
        v-bind:key="street.id"
        v-bind:street="street"
        v-bind:active="chosenStr === street.id"
        @click.native="chooseStreet(street.id)"
      >
      </StreetEntry>
    </div>
    <button class="load btn" :disabled="page <= 0" @click="previousPage()">
      &lt; {{ $t("searchFrame.previous") }}
    </button>
    |
    <button class="load btn" :disabled="!hasMore" @click="nextPage()">{{ $t("searchFrame.next") }} &gt;</button>
  </div>
</template>
<script>
import {M2wApi} from "../services/m2w_api";
import {basemap} from "../services/map/basemap";
import StreetEntry from "@/components/page_elements/StreetEntry";

export default {
  name: "SearchFrame",
  components: {StreetEntry},
  data() {
    return {
      host_address: M2wApi.host_address,
      isLoading: true,
      hasError: false,
      chosenStr: 0,
      chosenPoi: {},
      page: 0,
      pageSize: 10,
      searchResults: {},
      searchTerm: null
    };
  },
  computed: {
    noResults() {
      return this.searchResults.poi_total === 0 && this.searchResults.streets_total === 0;
    },
    poisNotEmpty() {
      return this.searchResults.poi_total > 0;
    },
    poisEmpty() {
      return this.searchResults.poi_total === 0 && this.searchResults.streets.streets_total > 0;
    },
    hasMore() {
      const currentHits = this.pageSize * (this.page + 1);
      return currentHits < this.searchResults.poi_total || currentHits < this.searchResults.steets_total;
    }
  },
  async mounted() {
    await this.doSearch();
  },
  async deactivated() {
    await this.clearMap();
  },
  watch: {
    "$route.query.q"(val) {
      if (val) this.doSearch();
    },
    "$route.query.page"(val) {
      if (!isNaN(val)) this.doSearch();
    }
  },
  methods: {
    async doSearch() {
      this.isLoading = true;
      this.hasError = false;
      await this.clearMap();
      this.chosenPoi = {}
      const q = this.$route.query;
      this.searchTerm = q.q;
      this.page = parseInt(q.page, 10);
      try {
        this.searchResults = await M2wApi.get_search_results(this.searchTerm, this.page,
            this.pageSize, q.location, this.$i18n.locale);
        this.populateMap();
      } catch {
        this.hasError = true;
      }
      this.isLoading = false;
    },

    nextPage() {
      if (this.hasMore) this.$router.push({query: {...this.$route.query, page: this.page + 1}});
    },
    previousPage() {
      if (this.page > 0) this.$router.push({query: {...this.$route.query, page: this.page - 1}});
    },

    choosePoi(poi) {
      basemap.map.getView().setZoom(17);
      basemap.map.getView().setCenter(poi.geom.coordinates);
      basemap.setCircleMarkerStyle(poi);
      this.chosenPoi = poi;
      this.$router.push({name: "poiDetails", params: {id: poi.id}});
    },
    mouseover(poi) {
      if (this.poisNotEmpty) basemap.setCircleMarkerStyle(poi);
    },
    mouseleave(poi) {
      basemap.deleteOverlayMarker(poi);
    },
    clearMap() {
      basemap.deleteCluster(this.searchResults);
      basemap.deleteMarkers(this.searchResults.pois);
      basemap.deleteDisplay(this.chosenPoi)
    },
    populateMap() {
      basemap.setCluster(this.searchResults, "rgba(255,0,0,0.7)");
    },
    chooseStreet(street) {
      // click on street again to hide it
      if (this.chosenStr === street) {
        this.chosenStr = 0;
      } else {
        this.chosenStr = street;
      }
    }
  },
};
</script>
