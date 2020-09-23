<template>
  <div id="menu-popup">
    <div id="main-wrapper">
      <!-- menu and category header -->
      <div id="menu-header" v-if="headerVisible">
        <button
          v-for="frame in categoryFrames"
          :key="frame"
          :class="{active: currentComponent === frame}"
          @click="updateFrame(frame)"
        >
          {{ $t("menuPopup." + frame) }}
        </button>
      </div>
      <!-- component frame -->
      <keep-alive>
        <component :is="currentTabComponent" @showHeader="showHeader" />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import CategoriesFrame from "./CategoriesFrame.vue";
import StreetDirectoryFrame from "./StreetDirectoryFrame";

export default {
  name: "MenuPopup",
  components: {CategoriesFrame, StreetDirectoryFrame},
  data() {
    return {
      currentComponent: "pois",
      categoryFrames: ["pois", "streets"],
      headerVisible: true
    };
  },
  watch: {
    "$route.params.view": function (view){
      if (view && this.categoryFrames.includes(view))
        this.currentComponent = view;
    }
  },
  async created() {
    let view = this.$route.params["view"];
    if (view && this.categoryFrames.includes(view)) this.currentComponent = view;
  },

  computed: {
    currentTabComponent: function() {
      switch (this.currentComponent) {
        case "pois":
          return "CategoriesFrame";
        case "streets":
          return "StreetDirectoryFrame";
        default:
          return null;
      }
    }
  },

  methods: {
    updateFrame(frame) {
      this.currentComponent = frame;
      this.$router.push({params: {view: frame}});
    },

    showHeader(visible) {
      this.headerVisible = visible;
    }
  }
};
</script>
