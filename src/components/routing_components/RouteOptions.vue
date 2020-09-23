<template>
  <div class="route-options">
    <div class="option-label">{{ $t('routeFrame.routeOptions')}}</div>
    <div class="option">
      <input
        type="checkbox"
        value="Autobahnen"
        v-model="options.highways"
      />
      <div>{{ $t("routeFrame.highway")}}</div>
    </div>
    <div class="option">
      <input
        type="checkbox"
        value="Mautstraßen"
        v-model="options.tolls"
      />
      <div>{{ $t("routeFrame.tollRoad")}}</div>
    </div>
    <div class="option">
      <input
        type="checkbox"
        value="Fähren"
        v-model="options.ferries"
      />
      <div>{{ $t("routeFrame.ferry")}}</div>
    </div>
    <div class="option-label">{{ $t("routeFrame.units")}}</div>
    <div class="option">
      <input type="radio" id="km" value="metric" v-model="options.units" />
      <div>{{ $t("routeFrame.metric")}}</div>
    </div>
    <div class="option">
      <input type="radio" id="ml" value="imperial" v-model="options.units" />
      <div>{{ $t("routeFrame.imperial")}}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    options: Object
  }
};
</script>
