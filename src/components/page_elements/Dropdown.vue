<template>
  <div class="dropdown" :class="{active: isExtended}">
    <button class="dropdown-btn" @click.stop="toggle">
      <div>{{ selected ? selected[view] : placeholder }}</div>
      <img src="../../assets/icons/arrow.png" alt="" />
    </button>
    <div class="dropdown-container">
      <a @click.stop="select(elem)" v-for="elem in options" :key="elem[kex]">{{ elem[view] }}</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "Dropdown.vue",
  props: ["options", "kex", "view", "placeholder", "selected"],
  data() {
    return {
      isExtended: false
    };
  },
  methods: {
    toggle() {
      this.isExtended = !this.isExtended;
    },
    select(elem) {
      this.isExtended = false;
      this.$emit("selected", elem);
    }
  }
};
</script>

<style scoped></style>
