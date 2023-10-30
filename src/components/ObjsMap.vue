<template>
  <div id="map" class="map" ></div>
</template>

<script>
import Circle from 'ol/geom/Circle.js';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';


export default {
  components: {},
  props: {
    collectionFeatures: Object,
  },
  data() {
    return {
    }
  },
  computed: {},
  methods: {
    initMap() {
      const image = new CircleStyle({
        radius: 5,
        fill: null,
        stroke: new Stroke({color: 'red', width: 1}),
      });

      const styles = {
        'Point': new Style({
          image: image,
        })
      };

      const styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
      };

      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(this.collectionFeatures),
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction,
      });

      const map = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          vectorLayer,
        ],
        target: 'map',
        // projection: ['EPSG:32639'],
        view: new View({
          // extent: [5200000, 7100000, 6000000, 7800000],
          center: [367899, 6058270],
          zoom: 8
        }),
      });
    },

  },
  mounted() {
    this.initMap();

  },
}
</script>

<style lang="scss">
.map {
  width: 100%;
  height: 100%;
}
</style>
