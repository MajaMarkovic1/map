// import { expect } from "chai";
// import { shallowMount } from "@vue/test-utils";
// import LayersControl from "@/components/button_controls/LayersControl.vue";
// // import MapComponent from "@/components/MapComponent.vue";
// import SettingButtons from "@/components/button_controls/SettingButtons.vue";
// import MenuComponent from "@/components/MenuComponent.vue";
// import MenuPopup from "@/components/category_components/MenuPopup.vue";
// // import CategoriesFrame from "@/components/category_components/CategoriesFrame.vue";

// require("es6-promise").polyfill();
// import "isomorphic-fetch";

// // describe("HelloWorld.vue", () => {
// //   it("renders props.msg when passed", () => {
// //     const msg = "new message";
// //     const wrapper = shallowMount(HelloWorld, {
// //       propsData: { msg }
// //     });
// //     expect(wrapper.text()).to.include(msg);
// //   });
// // });
// // let wrapper1 = null;
// let layersControlWrapper = null;
// let SettingButtonsWrapper = null;
// let MenuComponentWrapper = null;
// let MenuPopupWrapper = null;
// // let CategoriesFrameWrapper = null;
// let projectInfo = null;
// // let projectPOIs = null;
// before(async () => {
//   projectInfo = require("../data/project_info.json");
//   // projectPOIs = require("../data/project_pois.json");

//   // wrapper1 = shallowMount(MapComponent);
//   layersControlWrapper = shallowMount(LayersControl, {
//     data() {
//       return {
//         allLayers: projectInfo.base_layers,
//         activeLayer: projectInfo.default_base_layer
//       };
//     }
//   });
//   SettingButtonsWrapper = shallowMount(SettingButtons);
//   MenuComponentWrapper = shallowMount(MenuComponent, {
//     mocks: {
//       $t: () => {}
//     }
//   });
//   MenuPopupWrapper = shallowMount(MenuPopup, {
//     mocks: {
//       $t: () => {}
//     }
//   });
// //   CategoriesFrameWrapper = shallowMount(CategoriesFrame, {
// //     propsData: {
// //       categories: projectPOIs.children,

// //     }
// //  });
// });

// // testing Layers frame

// describe("Layers", () => {
//   it("should display all layers", () => {
//     expect(
//       layersControlWrapper.findAll(".layers-wrapper button").length
//     ).to.equal(projectInfo.base_layers.length);
//   });
//   it("should set active layer", () => {
//     expect(
//       layersControlWrapper
//         .findAll(".layers-wrapper button")
//         .at(projectInfo.default_base_layer - 1)
//         .classes()
//     ).to.include("active");
//   });
// });

// // testing setting buttons in right corner

// describe("Settings buttons", () => {
//   it("should set active settings button", async () => {
//     await SettingButtonsWrapper.find(".settings-icon").trigger("click");
//     expect(
//       SettingButtonsWrapper.find("controlpopup-stub").attributes().currentname
//     ).to.equal("Settings");
//   });
//   it("should set active layer button", async () => {
//     await SettingButtonsWrapper.find(".layers-icon").trigger("click");
//     expect(
//       SettingButtonsWrapper.find("controlpopup-stub").attributes().currentname
//     ).to.equal("Layers");
//   });
// });

// //  testing Menu popup

// describe("Menu", () => {
//   it("should activate Menu popup", async () => {
//     await MenuComponentWrapper.find(".menu-icon").trigger("click");
//     expect(MenuComponentWrapper.find("menupopup-stub").classes()).to.include(
//       "active"
//     );
//   });
//   it("should activate clicked tab", async () => {
//     expect(MenuPopupWrapper.find(".categories").classes()).to.include("active");

//     await MenuPopupWrapper.find(".streetdirectory").trigger("click");
//     expect(MenuPopupWrapper.find(".streetdirectory").classes()).to.include(
//       "active"
//     );
//     await MenuPopupWrapper.find(".categories").trigger("click");
//   });
// });

// // testing Categories

// // let chosenCategory = {};
// // describe("Categories", () => {
// //   it("should display all categories for this project", () => {
//     // console.log(CategoriesFrameWrapper)
//     // expect(CategoriesFrameWrapper.findAll(".category").length).to.equal(
//     //   projectPOIs.children.length
//     // );
// //  });
// //   it("should activate chosen category", async () => {
// //     await CategoriesFrameWrapper.findAll(".category")
// //       .at(1)
// //       .trigger("click");
// //     chosenCategory = CategoriesFrameWrapper.emitted().chooseCategory[0][0];
// //     await MenuPopupWrapper.setData({
// //       category: chosenCategory,
// //     });
// //     expect(chosenCategory.name).to.equal(projectPOIs.children[1].name);
// //   });
// //   it("should go back to main categories frame", async () => {
// //     expect(MenuPopupWrapper.find("#category-header").isVisible()).to.equal(true)
// //     await MenuPopupWrapper.find("#category-header button").trigger("click")
// //     expect(MenuPopupWrapper.find("#menu-header").isVisible()).to.equal(true)
// //   });
// // });

