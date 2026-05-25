<template>
  <div class="ObjsMiniMap" v-if="coords">
    <div ref="miniMapContainer" class="mini-map-container"></div>
  </div>
</template>

<script>
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style.js';
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
    pointName: {
      type: String,
      default: '',
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
        const textStyle = this.pointName ? new Text({
          text: this.pointName,
          font: 'bold 16px NotoSans, sans-serif',
          fill: new Fill({color: 'rgba(0, 0, 0, 0.95)'}),
          stroke: new Stroke({color: 'rgba(255, 255, 255, 0.9)', width: 4}),
          offsetY: -24,
          offsetX: 0,
          textAlign: 'center',
          textBaseline: 'bottom',
        }) : undefined;

        return new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(this.oneFeature, {}),
          }),
          name: 'mini-one',
          style: new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({color: 'red'}),
              stroke: new Stroke({color: 'black', width: 2}),
            }),
            text: textStyle,
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
    recreateLayer() {
      if (!this.map) return;
      // remove old one layer if exists
      this.map.getLayers().forEach(layer => {
        if (layer.get('name') === 'mini-one') {
          this.map.removeLayer(layer);
        }
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
        this.recreateLayer();
      }
    },
    pointName() {
      if (this.map && this.coords) {
        this.recreateLayer();
      }
    },
  },
}
</script>

<style lang="scss">
.ObjsMiniMap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .mini-map-container {
    width: 100%;
    height: 100%;
  }
}
</style>