<template>
  <button class="fullscreen-control" @click="toggleFullscreen($event)"></button>
</template>

<script>
export default {
  methods: {
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  }
};
</script>
