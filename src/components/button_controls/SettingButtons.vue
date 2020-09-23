<template>
  <div>
    <div id="setting-buttons">
      <button
        v-for="component in components"
        v-bind:key="component"
        :class="[component.toLowerCase() + '-icon', {active: component === currentComponent}]"
        v-on:click="toggleFrame(component)"
      />
      <FullScreenControl />
    </div>
    <ControlPopup :currentName="currentComponent" @closeFrame="closeFrame" @measure="$emit('measure')" />
  </div>
</template>
<script>
import FullScreenControl from "./FullScreenControl";
import ControlPopup from "./ControlPopup";

export default {
  components: {ControlPopup, FullScreenControl},
  data() {
    return {
      currentComponent: null,
      components: ["Settings", "Layers"]
    };
  },
  methods: {
    toggleFrame(component) {
      if (this.currentComponent === component) this.currentComponent = null;
      else this.currentComponent = component;
    },
    closeFrame() {
      this.currentComponent = null;
    }
  }
};
</script>
