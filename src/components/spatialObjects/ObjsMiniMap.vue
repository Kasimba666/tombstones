<template>
  <div class="ObjsMiniMap" v-if="coords">
    <div ref="miniMapContainer" class="mini-map-container"></div>
  </div>
</template>

<script>
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {ScaleLine} from 'ol/control.js';

export default {
  name: 'ObjsMiniMap',
  props: {
    coords: {
      type: Array,
      default: null,
    },
    featureGeojson: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      map: null,
    }
  },
  computed: {
    oneFeature() {
      if (!this.featureGeojson || !this.coords) return null;
      return {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: this.coords,
          },
          properties: {},
        }],
      };
    },
    vectorLayerOne() {
      if (!!this.oneFeature) {
        return new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(this.oneFeature, {}),
          }),
          name: 'mini-one',
          style: new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({color: 'rgba(220, 50, 50, 0.9)'}),
              stroke: new Stroke({color: '#fff', width: 2}),
            }),
          }),
          zIndex: 10,
        });
      }
      return null;
    },
  },
  methods: {
    initMap() {
      if (!this.coords) return;
      const center = this.coords;
      this.map = new Map({
        layers: [
          new TileLayer({source: new OSM()}),
        ],
        target: this.$refs.miniMapContainer,
        view: new View({
          center: center,
          zoom: 14,
        }),
        controls: [
          new ScaleLine({units: 'metric', bar: true}),
        ],
        interactions: [],
      });

      if (this.vectorLayerOne) {
        this.map.addLayer(this.vectorLayerOne);
      }
    },
  },
  mounted() {
    this.initMap();
  },
  watch: {
    coords() {
      if (this.map && this.coords) {
        this.map.getView().setCenter(this.coords);
        this.map.getView().setZoom(14);
        // remove old one layer if exists
        this.map.getLayers().forEach(layer => {
          if (layer.get('name') === 'mini-one') {
            this.map.removeLayer(layer);
          }
        });
        if (this.vectorLayerOne) {
          this.map.addLayer(this.vectorLayerOne);
        }
      }
    },
  },
}
</script>

<style lang="scss">
.ObjsMiniMap {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: 5px;
  overflow: hidden;
  border: 2px solid hsla(0, 0%, 50%, 0.2);

  .mini-map-container {
    width: 100%;
    height: 100%;
  }
}
</style>