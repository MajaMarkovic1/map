<template>
  <div id="app">
    <!-- <div id="nav"> -->
    <!-- <router-link to="/">Home</router-link> | -->
    <!-- <router-link to="/about">About</router-link> -->
    <!-- </div> -->
    <router-view />
  </div>
</template>

<style lang="scss">
@import "./assets/css/reset.css";
@import "./assets/css/basemap.scss";
@import "./assets/css/menu-popup.scss";
@import "assets/css/search-frame";
@import "./assets/css/menu-component.scss";
@import "./assets/css/category-frame.scss";
@import "assets/css/control-popup";
@import "assets/css/single-poi";
@import "assets/css/poi-data";
@import "assets/css/streets-popup";
@import "assets/css/right-click-frame";
@import "assets/css/dropdown";
@import "assets/css/measure-frame";
@import "assets/css/routing/main";
@import "assets/css/routing/drive-options";
@import "assets/css/routing/steps-frame";
@import "assets/css/settings-frame";
@import "assets/css/legend";


#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
