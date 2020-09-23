<template>
    <div class="legend">
        <button class="close-btn" @click="$router.go(-1)"><img src="../../assets/icons/close.png" alt=""></button>
        <div class="legend-img"><img :src="hostAddress + legendImgSrc" alt=""></div>
    </div>
</template>
<script>
import Vue from "vue";
import {M2wApi} from "@/services/m2w_api";

export default {
    data() {
        return {
            hostAddress: M2wApi.host_address,
            legendImgSrc: Vue.config.project.sf_basemap.legend_url,
        }
    },
    props: {
        activeFrame: Boolean
    },
   
}
</script>
