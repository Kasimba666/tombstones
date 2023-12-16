<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
        <div class="objs-main">
          <obj-details :style="{display: visibleDetails ?'block':'none'}"
                       :details="details"
                       :imgs="imgs_details"
                       @clickCloseDetails="closeDetails"
          >
          </obj-details>
          <div :style="{display: visibleFiltersAndList ?'block':'none'}">
            <objs-filters v-if="!!this.filters"
                          :filters="filters"
                          @onSetFiltersValues="onSetFiltersValues"
            >
            </objs-filters>
            <objs-view-mode-panel v-if="!modeListAndTable"
                                  :allViewModes="viewModes"
                                  :currrentViewMode="currentViewMode"
                                  @setViewMode="setViewMode"
            >Выбор режима просмотра

            </objs-view-mode-panel>
            <objs-list v-if="modeListAndTable || currentViewMode === 'list'"
                       :rows="rows"
                       :cols="cols"
                       :currentRow="currentRow"
                       :listMode="listMode"
                       @clickRow="setCurrentFeatureFromObjsList"
            >
            </objs-list>

          </div>
        </div>
      </div>
      <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
        <div class="objs-map" v-if="modeListAndTable || currentViewMode === 'map' || visibleDetails">
          <objs-map v-if="!!collectionFeaturesForMaps"
                    :collectionFeatures="collectionFeaturesForMaps"
                    :oneFeature="oneFeatureForMaps"
                    :scheme="scheme"
                    @clickPoint="setCurrentFeatureFromObjsMap"
          >
          </objs-map>
        </div>
      </div>
    </div>
  </div>


</template>

<script>
import ObjsList from "./ObjsList";
import ObjDetails from "./ObjsDetails";
import ObjsFilters from "./ObjsFilters";
import ObjsMap from "./ObjsMap";
import {mapGetters} from "vuex";
import ObjsViewModePanel from "@/components/ObjsViewModePanel";

export default {
  components: {ObjsViewModePanel, ObjsList, ObjDetails, ObjsFilters, ObjsMap},
  props: {geojson: Object, imgs: Array, scheme: Array, filters: Array},
  emits: ['onSetFiltersValues'],
  data() {
    return {
      currentFeature: null,
      visibleFiltersAndList: true,
      visibleDetails: false,
      viewModes: ['list', 'map'],
      currentViewMode: 'list',

    }
  },
  computed: {
    ...mapGetters({screen: "getScreen", screenBreakpoints: "getScreenBreakpoints"}),
    listMode() {
      return (this.screen.type === 'xs' || this.screen.type === 'sm') ? 'cards' : 'table'
    },

    cols() {
      let tempCols = [];
      this.scheme.forEach((item) => {
        if (item.inTable === 1) {
          tempCols.push({attrName: item.attrName, titleName: item.title, colSize: item.colSize})
        }
      });
      return tempCols;
    },

    rows() {
      if (this.geojson === null) return null;
      let tempRows = this.geojson.features.map((feature) => {
        let tempProperties = {};
        this.scheme.forEach((item) => {
          if (item.inTable === 1) {
            tempProperties[item.attrName] = feature.properties[item.attrName];
          }
        });
        //добавить картинку в виде объекта
        tempProperties['img'] = this.imgs.filter((v) => {
          if (v['category'].toString() === 'cards' && v['id'].toString() === feature.properties['id'].toString()) {
            return v
          }
        })[0];
        return tempProperties
      });
      return tempRows.sort((a, b) => a['name'].localeCompare(b['name']));

    },


    currentRow() {
      if (this.currentFeature === null) return null;
      let tempProperties = {};
      this.scheme.forEach((item) => {
        if (item.inTable === 1) {
          tempProperties[item.attrName] = this.currentFeature.features[0].properties[item.attrName];
        }
      });
      return tempProperties
    },

    details() {
      if (this.currentFeature != null) {
        let tempDetails = [];

        this.scheme.forEach((item) => {
          if (item.inDetails === 1) {
            tempDetails.push({
              attrName: item.attrName,
              titleName: item.title,
              value: this.currentFeature.features[0].properties[item.attrName]
            });
          }
        });
        return tempDetails
      }
    },
    imgs_details() {
      if (!(this.currentFeature === null) && !(this.imgs === null)) {
        return this.imgs.filter((v) => {
          if (v['id'].toString() === this.currentFeature.features[0].properties['id'].toString()) {
            return v
          }
        });
      }
    },
    oneFeatureForMaps() {
      if (!!this.currentFeature) {
        let newProperties = {};
        this.scheme.forEach((item) => {
          if (item.inMap === 1) {
            newProperties[item.attrName] = this.currentFeature.features[0].properties[item.attrName];
          }
        });
        return {
          type: this.currentFeature.type,
          name: this.currentFeature.name,
          crs: this.currentFeature.crs,
          features: [{
            type: this.currentFeature.features[0].type,
            properties: newProperties,
            geometry: this.currentFeature.features[0].geometry,
          }],
        }
      } else return null
    },
    collectionFeaturesForMaps() {
      if (!!this.geojson) {
        let newFeatures = this.geojson.features.map((feature) => {
          let newProperties = {};
          this.scheme.forEach((item) => {
            if (item.inMap === 1) {
              newProperties[item.attrName] = feature.properties[item.attrName];
            }
          });
          return {
            type: feature.type,
            properties: newProperties,
            geometry: feature.geometry,
          }
        });
        return {
          type: this.geojson.type,
          name: this.geojson.name,
          crs: this.geojson.crs,
          features: newFeatures,
        }
      }
    },
    modeListAndTable() {
      return (this.screen.type != 'xs' && this.screen.type != 'sm')
    },
  },
  methods: {
    init() {
      // this.currentViewMode = (this.screen.type === 'xs' || this.screen.type === 'sm') ? 'list' : 'all';
    },
    setCurrentFeatureFromObjsMap(point) {
      // установить текущий объект на основе выбранного в картах
      if (!!this.geojson && !!point) {
        this.currentFeature = {
          type: this.geojson.type,
          name: this.geojson.name,
          crs: this.geojson.crs,
          features: [],
        }
      }
      this.currentFeature.features.push(this.geojson.features.filter((feature) => {
        let isEqual = true;
        Object.entries(point.features[0].properties).forEach(([key, value]) => {
          if (feature.properties[key] != value) isEqual = false;
        });
        if (isEqual) return feature;
      })[0]);
      this.visibleDetails = true
      this.visibleFiltersAndList = false;
    },
    setCurrentFeatureFromObjsList(row) {
      //найти объект в общем списке, который соответствует всем полям присланной строки
      if (!!this.geojson && !!row) {
        this.currentFeature = {
          type: this.geojson.type,
          name: this.geojson.name,
          crs: this.geojson.crs,
          features: [],
        }
        this.currentFeature.features.push(this.geojson.features.filter((feature) => {
          let isEqual = true;
          Object.entries(row).forEach(([key, value]) => {
            if (key != 'img' && feature.properties[key] != value) isEqual = false;
          });
          if (isEqual) return feature;
        })[0]);
      }//if
      this.visibleDetails = true
      this.visibleFiltersAndList = false;
    },
    closeDetails() {
      this.visibleDetails = false;
      this.visibleFiltersAndList = true;
    },

    onSetFiltersValues(v) {
      this.$emit('onSetFiltersValues', v);
      //проверить, входит ли текущий объект в новый набор
      if (this.currentFeature != null) {
        if (this.geojson.features.length === 0) {
          this.currentFeature = null;
        } else if (!this.geojson.features.some(v => JSON.stringify(v) === JSON.stringify(this.currentFeature.features[0]))) {
          this.currentFeature = null;
        }
      }
    },
    setViewMode(v) {
      this.currentViewMode = v;
    },
  },
  mounted() {
    // this.init();
  },
}
</script>

<style lang="scss">

.objs-main {
  //border: 1px solid black;
  width: 100%;
  height: auto;

  .filters-and-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    background-color: transparent;

    .filters {
      background-color: transparent;
      padding: 5px;
      border: 1px solid red;
    }

    .list {
      background-color: transparent;
      padding: 5px;

    }
  }

  .details {
    width: 100%;
    height: auto;
  }
}

.objs-map {
  width: 100%;
  height: 80vh;
  //background-color: lightgrey;
}

</style>
