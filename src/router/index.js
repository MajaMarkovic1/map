import Vue from "vue";
import VueRouter from "vue-router";
import MapComponent from "../components/MapComponent";
import MenuComponent from "../components/MenuComponent";
import MenuPopup from "../components/category_components/MenuPopup";
import SearchFrame from "../components/SearchFrame";
import PoiDetails from "../components/category_components/PoiDetails";
import DirectionsComponent from "../components/routing_components/DirectionsComponent";
import MeasureComponent from "../components/setting_components/MeasureComponent";
import Legend from "../components/setting_components/Legend";


Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: MapComponent,
    children: [
      {
        path: "",
        name: "default",
        component: MenuComponent,
        children: [
          {
            path: "lists/:view?",
            name: "pois",
            component: MenuPopup
          },
          {
            path: "search",
            name: "search",
            component: SearchFrame
          },
          {
            path: "poi/:id",
            name: "poiDetails",
            component: PoiDetails
          },
          {
            path: "measure",
            name: "measure",
            component: MeasureComponent
          },
          {
            path: "legend",
            name: "legend",
            component: Legend,
          }
        ]
      },
      {
        path: "/directions",
        name: "directions",
        component: DirectionsComponent
      }
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

/*function hasQueryParams(route) {
  return !!Object.keys(route.query).length
}

router.beforeEach((to, from, next) => {
  if(!hasQueryParams(to) && hasQueryParams(from)){
    next({name: to.name, path: to.path, params: to.params, query: from.query});
  } else {
    next()
  }
})*/

export default router;
