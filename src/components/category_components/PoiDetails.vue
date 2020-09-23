<template>
  <div id="poi-data" v-if="poiData" :class="{active: showMore}">
    <div id="poi-header" v-if="parent">
      <button @click="goBack">
        <img id="arrow" src="../../assets/icons/arrow.png" />
        {{ $t("menuPopup.back") }}
      </button>
    </div>
    <div class="cover-wrapper">
      <div class="close-button" v-if="!parent" @click="$router.back()">
        <img src="../../assets/icons/close1.png" />
      </div>
      <div class="cover" v-if="poiData.cover">
        <img class="cover-img" :src="hostAddress + poiData.cover" alt="" />
        <img class="cover-logo" v-if="poiData.logo" :src="hostAddress + poiData.logo" alt="" />
      </div>
      <div class="poi-infos">
        <div class="poi-intro">
          <div class="poi-name">{{ poiData.name }}</div>
          <div class="poi-address" v-if="poiData.address">
            {{ poiData.address[0] }}
          </div>
          <div class="poi-address" v-if="poiData.address">
            {{ poiData.address[1] }}
          </div>
          <div class="poi-parent">
            <div class="category-name">
              <img v-if="poiData.parent.logo" :src="hostAddress + poiData.parent.logo" />
              <div>{{ poiData.parent.name }}</div>
            </div>
            <div class="is-open-info" :class="{open: isOpened}" v-if="poiData.opening_hours">
              <img src="../../assets/icons/timer.png" alt="" />
              {{ isOpened ? $t("poiDetails.opened") : $t("poiDetails.closed") }}
            </div>
          </div>
          <div class="poi-tel" v-if="poiData.contact">
            <a :href="'tel:' + poiData.contact.tel1">{{ poiData.contact.tel1 }}</a>
          </div>
          <div class="poi-links">
            <div class="poi-link" v-if="poiData.contact.mail">
              <a :href="'mailto:' + poiData.contact.mail">{{ poiData.contact.mail }}</a>
            </div>
            <div class="poi-link" v-if="poiData.contact.website">
              <a :href="poiData.contact.website" target="_blank">{{ websiteDisplay }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="more-infos-wrapper">
      <div class="poi-icons">
        <button><img src="../../assets/icons/marker.png" alt="" /></button>
        <button><img src="../../assets/icons/phone.png" alt="" /></button>
        <button><img src="../../assets/icons/share.png" alt="" /></button>
        <button><img src="../../assets/icons/directions.png" alt="" /></button>
      </div>
      <div class="more-info" :class="{active: showMore}" v-if="poiData.opening_hours || poiData.long_info">
        <div class="opening-schedule" v-if="poiData.opening_hours">
          <div class="time-info">{{ $t("poiDetails.openingHours") }}</div>
          <table class="opening-schedule">
            <tr class="working-days" v-for="day in weekDays" :key="day.id">
              <td>{{ $t("general." + day.toLowerCase()) }}</td>
              <td v-if="poiData.opening_hours[day].length > 0">
                <div v-for="op in poiData.opening_hours[day]" :key="op[0]">{{ op[0] }} - {{ op[1] }}</div>
              </td>
              <td v-else>{{ $t("poiDetails.closed") }}</td>
            </tr>
          </table>
        </div>
        <div v-if="poiData.long_info">
          <div class="time-info">{{ $t("poiDetails.moreInfo") }}</div>
          <div class="additional-info" v-html="poiData.long_info"></div>
        </div>
      </div>
      <div v-if="poiData.opening_hours || poiData.long_info" class="addit-info" @click="showMore = !showMore">
        {{ showMore ? $t("poiDetails.showLess") : $t("poiDetails.showMore") }}
      </div>
    </div>
  </div>
</template>
<script>
import {categoryService} from "@/services/category";
import {M2wApi} from "@/services/m2w_api";
import {basemap} from "@/services/map/basemap";

export default {
  name: "PoiDetails",
  data() {
    return {
      weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      hostAddress: M2wApi.host_address,
      poiData: null,
      showMore: false,
      prevRoute: null
    };
  },
  computed: {
    isOpened: function() {
      return categoryService.checkIfOpened(this.poiData);
    },
    openingHours: function() {
      return this.poiData.opening_hours;
    },
    parent: function() {
      return this.$route.query.parent;
    },
    websiteDisplay: function() {
      if (this.poiData.contact.web_label) return this.poiData.contact.web_label;

      let matches = this.poiData.contact.website.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
      if(matches)
        return matches[1];
      return "";
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },

  watch: {
    "$route.params.id": async function(id, oldId) {
      if (id && id != oldId)
        await this.fetchFromApi();
    }
  },

  async mounted() {
    await this.fetchFromApi();
  },

  deactivated() {
    basemap.deleteView(this.poiData);
  },

  beforeDestroy() {
    basemap.deleteView(this.poiData);
  },

  methods: {
    async fetchFromApi() {
      basemap.deleteView(this.poiData);
      this.poiData = null;
      const id = this.$route.params.id;
      this.poiData = await M2wApi.get_single_poi(id, this.$i18n.locale, this.parent);
      this.showOnMap();
    },

    showOnMap() {
      let center = basemap.createViewForPoi(this.poiData);
      basemap.map.getView().animate({
        center: center,
        duration: 500
      });
    },

    goBack(){
      // preserve other query properties
      if(this.prevRoute && this.prevRoute.name==="pois"){
        this.$router.go(-1);
      } else{
        this.$router.push({name:"pois", query:{"toc-id": this.parent}});
      }
    }
  }
};
</script>
