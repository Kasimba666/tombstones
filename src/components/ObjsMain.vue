<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
        <div class="objs-filters-list-details">
          <obj-details class="objs-filters-list filters-list details" :style="{display: visibleDetails ?'block':'none'}"
                       :details="details"
                       @clickCloseDetails="closeDetails"
          >
          </obj-details>
          <div class="objs-filters-list filters-list" :style="{display: visibleFiltersAndList ?'block':'none'}">
            <objs-filters v-if="!!this.filters"
                :filters="filters"
                @onSetFiltersValues="onSetFiltersValues"
            >
            </objs-filters>
            <objs-list
                :rows="rows"
                :titles="cols"
                @clickRow="clickOnRow"
            >
            </objs-list>
          </div>
        </div>
      </div>
            <div class="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
              <div class="objs-map">
                <objs-map v-if="!!collectionMap"
                    :collectionFeatures="collectionMap" >
                </objs-map>
              </div>
            </div>
    </div>
  </div>


</template>

<script>
import ObjsList from "./ObjsList";
import ObjDetails from "./ObjDetails";
import ObjsFilters from "./ObjsFilters";
import ObjsMap from "./ObjsMap";

export default {
  components: {ObjsList, ObjDetails, ObjsFilters, ObjsMap},
  props: {geojson: Object, scheme: Array, filters: Array},
  emits: ['onSetFiltersValues'],
  data() {
    return {
      fVs: [],
      currentFeature: null,
      visibleFiltersAndList: true,
      visibleDetails: false,
    }
  },
  computed: {
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
      if (!!this.geojson) {
        let tempRows = this.geojson.features.map((feature) => {
          let tempProperties = {};
          this.scheme.forEach((item) => {
            if (item.inTable === 1) {
              tempProperties[item.attrName] = feature.properties[item.attrName];
            }
          });
          return tempProperties
        });
        return tempRows;
      }
    },

    details() {
      if (!(this.currentFeature == null)) {
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
    currentFeatureMap() {
      if (!!this.currentFeature) {
        let tempProperties = {};
        this.scheme.forEach((item) => {
          if (item.inMap === 1) {
            tempProperties[item.attrName] = this.currentFeature.features[0].properties[item.attrName];
          }
        });

        return {
          type: this.currentFeature.type,
          name: this.currentFeature.name,
          crs: this.currentFeature.crs,
          features: [{
            type: this.currentFeature.features[0].type,
            properties: tempProperties,
            geometry: this.currentFeature.features[0].geometry,
          }]
        }
      }
    },
    collectionMap() {
      if (!!this.geojson) {
        let tempFeatures = this.geojson.features.map((feature) => {
          let tempProperties = {};
          this.scheme.forEach((item) => {
            if (item.inMap === 1) {
              tempProperties[item.attrName] = feature.properties[item.attrName];
            }
          });
          return {
            type: feature.type,
            properties: tempProperties,
            geometry: feature.geometry,
          }
        });
        return {
          type: this.geojson.type,
          name: this.geojson.name,
          crs: this.geojson.crs,
          features: tempFeatures,
        }
      }
    },
  },
  methods: {
    clickOnRow(v) {
      this.setCurrentFeature(v);
      this.visibleDetails = true
      this.visibleFiltersAndList = false;
    },
    setCurrentFeature(row) {
      //найти объект в общем списке, который соответствует всем полям присланной строки
      if (!!this.geojson && row) {
        let tempFeature = this.geojson.features.filter((feature) => {
          let isEqual = true;
          Object.keys(row).forEach(attr => {
            if (feature.properties[attr] != row[attr]) isEqual = false;
          });
          if (isEqual) return feature;
        })[0];
         this.currentFeature = {
          type: this.geojson.type,
          name: this.geojson.name,
          crs: this.geojson.crs,
          features: [tempFeature]
        }
      }//if
    },
    closeDetails() {
      this.visibleDetails = false;
      this.visibleFiltersAndList = true;
    },

    onSetFiltersValues(v) {
      this.$emit('onSetFiltersValues', v);
    },
  },
  mounted() {
  },
}
</script>

<style lang="scss">
.objs-filters-list-details {
  border: 1px solid black;

  .filters-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    background-color: hsl(0, 0%, 90%);


    .filters {
      background-color: hsl(0, 0%, 70%);
      padding: 5px;
    }

    .list {
      background-color: hsl(0, 0%, 70%);
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
  background-color: lightgrey;
}

</style>
