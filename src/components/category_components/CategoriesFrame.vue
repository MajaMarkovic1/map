<template>
  <div id="category-wrapper" v-if="currentCategory">
    <!-- chosen categories header -->
    <div id="category-header" v-if="currentCategory.parent">
      <button id="arrow" @click="chooseCategory(currentCategory.parent)">
        <img src="../../assets/icons/arrow.png" />
        {{ currentCategory.name }}
      </button>
      <div v-if="isLeafCategory" class="pin">
        <button v-if="!isPinned" @click="pin(currentCategory)">
          <img src="../../assets/icons/push_pin.png" style="transform: rotate(45deg);">
        </button>
        <button v-else @click="unPin(currentCategory)">
          <img src="../../assets/icons/push_pin.png">
        </button>
      </div>
    </div>
    <div id="chosen-category" v-if="pinnedCategories.length > 0">
      <div v-for="category in pinnedCategories" :key="category.id" class="chosen-single-cat">
        <div class="chosen-inner-cat">
          <div class="chosen-category-name">{{ category.name }} ({{ category.children.length }})</div>
          <button class="close-button" @click="unPin(category)">
            <img src="../../assets/icons/close1.png" alt="" />
          </button>
        </div>
      </div>
    </div>
    <div class="category-content">
      <div v-for="item in [...currentCategory.children, ...pinnedChildren]" :key="item.id" class="category-container">
        <button v-if="item.type === 'folder'" class="category" @click="chooseCategory(item)">
          <img v-if="item.image" :src="hostAddress + item.image" alt="" />
          <img v-else src="/images/placeholder.png" alt="" />
          <div class="category-box">
            <img v-if="item.logo" :src="hostAddress + item.logo" alt="" />
            <div class="category-name" v-html="item.name"></div>
          </div>
        </button>
        <PoiTocCard v-if="item.type === 'item'" :item="item" />
      </div>
    </div>
  </div>
</template>
<script>
import PoiTocCard from "./PoiTocCard";
import {M2wApi} from "@/services/m2w_api";
import {basemap} from "@/services/map/basemap";
import {categoryService} from "@/services/category";

export default {
  name: "CategoriesFrame",
  components: {PoiTocCard},
  data() {
    return {
      hostAddress: M2wApi.host_address,
      categoryTree: null,
      currentCategory: null,
      pinnedCategories: []
    };
  },

  async mounted() {
    this.categoryTree = await M2wApi.get_project_pois(this.$i18n.locale);
    // walking through the category tree to add back links
    this.linkChildren(this.categoryTree);
    this.onActivated();
  },
  activated() {
    // activated is also called on mounted (without waiting for async)
    // so this check prevents activated from firing when mounted is already underway
    if(this.categoryTree) {
      this.onActivated();
    }
  },
  deactivated() {
    if (this.currentCategory)
      basemap.deleteCluster(this.currentCategory);

    for (let cat of this.pinnedCategories)
      basemap.deleteCluster(cat);
  },

  computed: {
    pinnedChildren: function() {
      let distinctChildren = this.distinct(
        this.pinnedCategories
          .map(cat => cat.children)
          .flat()
          .filter(child => child.type === "item"),
        item => item.id
      );

      // only return items that are not children of the current category (as these are displayed anyhow)
      return distinctChildren.filter(c => !this.currentCategory.children.find(cc => c.id === cc.id));
    },
    isLeafCategory: function() {
      return this.currentCategory.children.length === 0 || this.currentCategory.children[0].type === "item";
    },
    isPinned: function() {
      return this.pinnedCategories.includes(this.currentCategory);
    }
  },

  watch: {
    pinnedCategories: async function(newValues, oldValues) {
      for (let cat of oldValues) {
        if (cat !== this.currentCategory && !newValues.includes(cat)){
          basemap.deleteCluster(cat);
          basemap.deleteCategoryLayer(cat);
        }
      }

      for (let cat of newValues) {
        if(oldValues.includes(cat))
          continue;
        if (!cat.color)
          cat.color = categoryService.getClusterColor();
        basemap.setCluster(cat, cat.color, this.goToPoi);
        await basemap.addCategoryLayer(cat);
      }
      let queryValue = newValues.map(cat => cat.id).join(',');
      this.$router.push({query: {...this.$route.query, pinned: queryValue}})
    }
  },

  methods: {
    chooseCategory(category) {
      // if the name actually is a link, open that link *facepalm*
      if(category.name && category.name.includes("href=")){
        let href = category.name.match(/href="(.+?)"/)[1];
        window.open(href);
      }
      // category without children is probably only an overlay thing
      else if(category.children.length === 0){
        this.pin(category);
      }
      else
        this.updateCurrentCategory(category, this.currentCategory);
    },

    updateCurrentCategory(category, oldCategory) {
      this.currentCategory = category;

      if (oldCategory && !this.pinnedCategories.includes(oldCategory)) {
        basemap.deleteCluster(oldCategory);
        basemap.deleteCategoryLayer(oldCategory);
      }

      if (!category.color)
        category.color = categoryService.getClusterColor();

      basemap.setCluster(category, category.color, this.goToPoi);
      basemap.addCategoryLayer(category);

      this.$emit("showHeader", category.name === null);

      // update URL for deep linking
      if(!category.id && this.$route.query["toc-id"]) {
        const { ["toc-id"]: _, ...filtered } = this.$route.query;
        this.$router.push({query: filtered});
      }
      if(category.id && this.$route.query["toc-id"] !== category.id.toString() )
        this.$router.push({query: {...this.$route.query, "toc-id": category.id}});
    },

    onActivated(){
      this.currentCategory = this.findCurrentCategory();
      this.updateCurrentCategory(this.currentCategory, null);

      this.pinnedCategories = this.findPinnedCategories();
      for (let cat of this.pinnedCategories.filter(c => c !== this.currentCategory))
        basemap.setCluster(cat, cat.color, this.goToPoi);
    },

    pin(category) {
      // if the category is already in the collection, bail early
      if (this.pinnedCategories.includes(category)) return;

      this.pinnedCategories = [...this.pinnedCategories, category];
    },

    unPin(category) {
      if (this.pinnedCategories.includes(category)) {
        this.pinnedCategories = this.pinnedCategories.filter(c => c !== category);
      }
    },

    linkChildren(category) {
      if (category.children) {
        for (let child of category.children) {
          child["parent"] = category;
          this.linkChildren(child);
        }
      }
    },

    findCurrentCategory() {
      let catId = this.$route.query["toc-id"];
      if(catId && !isNaN(catId))
        return this.findCategory(this.categoryTree, parseInt(catId));
      // no (valid) catId -> root node
      return this.categoryTree;
    },
    findCategory(node, catId) {
      if(node.id === catId)
        return node;
      if(node.children) {
        for(let child of node.children){
          let hit = this.findCategory(child, catId);
          if(hit)
            return hit;
        }
      }
      return null;
    },

    findPinnedCategories() {
      let catIds = this.$route.query["pinned"];
      if(!catIds)
        return [];

      let split = catIds.split(',');
      return split
          .map(chunk => chunk.trim())
          .filter(chunk => !isNaN(chunk))
          .map(chunk => parseInt(chunk))
          .filter((v, i, a) => a.indexOf(v) === i) // distinct
          .map(id => this.findCategory(this.categoryTree, id));
    },

    distinct(arr, func) {
      let tmp = {};
      return arr.filter(function(entry) {
        let key = func(entry);
        if (tmp[key]) {
          return false;
        }
        tmp[key] = true;
        return true;
      });
    },

    goToPoi(poi){
      this.$router.push({name: "poiDetails", params: {"id": poi.id}, query: {"parent": poi.parent.id}});
    }
  }
};
</script>
