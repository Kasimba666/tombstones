<template>
  <!--  <div>{{ collectionObjs }}</div>-->
  <div>{{ example }}</div>
  <div id="map" class="map"></div>
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
    collectionObjs: Object,
  },
  data() {
    return {
      example: null,
    }
  },
  computed: {},
  methods: {
    initMap() {
      this.example = {
        "type": "FeatureCollection",
        "name": "bolgar_settlements",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::32639"}},
        "features": [
          {
            "type": "Feature",
            "properties": {
              "id": 96,
              "name": "Старомайнское",
              "region": "ZK",
              "dating": null,
              "description": null,
              "literature": null,
              "type": "settlement",
              "area": null,
              "form": null,
              "location": null,
              "typesettlement": null,
              "sketchfab": null
            },
            "geometry": {"type": "Point", "coordinates": [367899.548268378595822, 6058270.796394211240113]}
          },
          {
            "type": "Feature",
            "properties": {
              "id": 1,
              "name": "Больше-Кляринское",
              "region": "PV",
              "dating": "XII–XIV вв.",
              "description": null,
              "literature": "Калинин Н.Ф., Халиков А.Х. Итоги археологических работ КФАН СССР 1945-1952 гг. Казань: Таткнигоиздат, 1954; Фахрутдинов Р.Г. Археологические памятники Волжско-Камской Булгарии и ее территория. Казань: Татарское книжное издательство, 1975; Губайдуллин А.М. Фортификация в Среднем Поволжье в X – первой половине XVI вв. // Археология Евразийских степей. Казань: Orange Key, 2019. № 3.",
              "type": "settlement",
              "area": 33000,
              "form": "Форма округлая. Линии укреплений представляют собой три вала и три рва, устроенных в один пояс.",
              "location": "Расположено в 1 км к северо-северо-западу от с. Большие Кляри Камско-Устьинского района РТ в левобережье р. Сухая Улема, правого притока р. Свияга на ровной местности. ",
              "typesettlement": "III",
              "sketchfab": null
            },
            "geometry": {"type": "Point", "coordinates": [370982.339488540717866, 6123296.051079603843391]}
          }]
      };
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
        features: new GeoJSON().readFeatures(this.example),
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
