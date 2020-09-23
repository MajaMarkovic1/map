<template>
  <div>
    <div id="menu-frame" class="search-box">
      <button class="btn lhs" :class="{active: isListsEnabled}" @click="toggleFrame()">
        <img src="../assets/icons/menu.png" alt="" />
      </button>
      <img class="line-icon left" src="../assets/icons/line.png" alt="" />
      <form action="/" @submit.prevent>
        <input
          type="text"
          :placeholder="$t('searchPlaceholder')"
          v-debounce:500ms="submit"
          v-model="searchTerm"
        />
      </form>
      <button class="close-button" :class="{active: !!searchTerm}" @click="clearSearch()">
        <img src="../assets/icons/close1.png" alt="" />
      </button>

      <button class="btn rhs" @click="openDirectionFrame()">
        <img src="../assets/icons/directions.png" alt="" />
      </button>
      <img class="line-icon right" src="../assets/icons/line.png" alt="" />
    </div>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>
<script>
import {basemap} from "@/services/map/basemap";

export default {
  data() {
    return {
      searchTerm: null,
      activeRouteFrame: false
    };
  },
  computed: {
    isListsEnabled: function() {
      return this.$route.path.indexOf("lists") >= 0;
    }
  },

  created() {
    this.searchTerm = this.$route.query["q"];
  },

  methods: {
    toggleFrame() {
      if (this.isListsEnabled) this.$router.push({name: "default"});
      else this.$router.push({name: "pois"});
    },
    submit() {
      this.search(this.searchTerm);
    },

    search(term) {
      if (term == "") {
        this.$router.push({name: "default"});
        return;
      }

      const view = basemap.map.getView();
      const center = view.getCenter();
      const serialized = center[0] + "," + center[1] + "," + view.getZoom();

      this.$router.push({
        name: "search",
        query: {
          q: term,
          page: 0,
          location: serialized
        }
      });
    },

    clearSearch() {
      this.searchTerm = "";
      if (this.$route.name === "search") {
        this.$router.push({name: "default"});
      }
    },
    openDirectionFrame() {
      this.$router.push({name: "directions"});
    }
  }
};
</script>
