<template>
  <!--  {{!!oneFeature ? oneFeature : ''}}-->
  <!--  {{!!vectorLayer ? vectorLayer : ''}}-->
  <div id="map" class="map"></div>
  <div id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    <div id="popup-content">{{contentPopup}}</div>
    <button @click="onSetCurrentPoint">Перейти</button>
  </div>
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
import Overlay from 'ol/Overlay.js';


const styles = {
  'PointCollection': new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({color: [255,0,0,0.2]}),
      stroke: new Stroke({color: 'red', width: 2}),
    }),
  }),
  'PointOne': new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({color: 'red'}),
      stroke: new Stroke({color: 'black', width: 2}),
    }),
  }),
};
const styleFunctionOne = function (feature) {
  return styles['PointOne'];
  // return styles[feature.getGeometry().getType()];
};

const styleFunctionCollection = function (feature) {
  //выбор стиля в зависимости от содержимого feature
  return styles['PointCollection'];
  // return styles[feature.getGeometry().getType()];
};

let currentPointFeature = null;

export default {

  components: {},
  props: {
    collectionFeatures: Object,
    oneFeature: Object,
  },
  emits: ['clickPoint'],
  data() {
    return {
      map: null,
      contentPopup: '',
      closer: null,
    }
  },
  computed: {
    bounds() {
      if (!!this.collectionFeatures && this.collectionFeatures['features'].length > 0) {
        let coordinates = this.collectionFeatures['features'].map(v => {
          return v['geometry']['coordinates'];
        });
        let coordinatesX = coordinates.map(v => +v[0].toFixed(0)).sort((a, b) => {
          return a > b ? 1 : -1
        });
        let coordinatesY = coordinates.map(v => +v[1].toFixed(0)).sort((a, b) => {
          return a > b ? 1 : -1
        });
        // let coordinatesX = coordinates.map(v=>Math.round(v[0])).sort((a,b)=>{return a>b ? 1 : -1});
        // let coordinatesY = coordinates.map(v=>Math.round(v[1])).sort((a,b)=>{return a>b ? 1 : -1});
        return [coordinatesX[0], coordinatesY[0], coordinatesX[coordinatesX.length - 1], coordinatesY[coordinatesY.length - 1]];
      } else return null
    },
    centerCollection() {
      if (this.bounds != null) {
        this.previousCenterCollection = [(this.bounds[2] + this.bounds[0]) / 2, (this.bounds[1] + this.bounds[3]) / 2];
      }
      return this.previousCenterCollection
    },
    centerOne() {
      if (!!this.oneFeature && this.oneFeature.features[0] != null) {
        this.previousCenterOne = [this.oneFeature.features[0]['geometry']['coordinates'][0], this.oneFeature.features[0]['geometry']['coordinates'][1]]
      }
      return this.previousCenterOne;
    },
    vectorLayerOne() {
      if (!!this.oneFeature) {
        return new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(this.oneFeature, {
              // featureProjection: 'EPSG:3857'
            })
          }),
          name: 'one',
          style: styleFunctionOne,
        });
      }
    },
    vectorLayerCollection() {
      if (!!this.collectionFeatures) {
        return new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(this.collectionFeatures, {
              // featureProjection: 'EPSG:3857'
            })
          }),
          name: 'collection',
          style: styleFunctionCollection,
        });
      }
    },
  },
  methods: {
    initMap() {
      this.previousCenterOne = this.centerCollection;
      /* Elements that make up the popup.*/
      const container = document.getElementById('popup');
      const content_element = document.getElementById('popup-content');
      const closer = document.getElementById('popup-closer');
      const overlay = new Overlay({
        element: container,
        autoPan: true,
        offset: [0, -10]
      });
      closer.onclick = function() {
        overlay.setPosition(undefined);
        this.blur();
        return false;
      };

      this.map = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        target: 'map',
        view: new View({
          // extent: this.bounds,
          center: this.centerCollection,
          zoom: 9,
        }),
      });
      if (this.collectionFeatures != null) this.map.addLayer(this.vectorLayerCollection);
      this.map.addOverlay(overlay);
      let tempCollectionFeatures = this.collectionFeatures;
      this.map.on('click', function(event){
        let feature = this.forEachFeatureAtPixel(event.pixel, function(feature, layer) {return feature; });
        if (feature != null && feature != undefined) {
          let coord = this.getCoordinateFromPixel(event.pixel);//Координаты точки как места на карте
          //найти в collectionFeatures сооветствие для feature
          currentPointFeature = {
            type: tempCollectionFeatures.type,
            name: tempCollectionFeatures.name,
            crs: tempCollectionFeatures.crs,
            features: [],
          }
          currentPointFeature.features.push(tempCollectionFeatures.features.filter((v) => {
            let isEqual = true;
            Object.entries(v.properties).forEach(([key, value]) => {
              if (feature.get(key) != value) isEqual = false;
            });
            if (isEqual) return v;
          })[0]);
          let content = '<h7>' + feature.get('name')+ '</h7>' + '<br>';
          Object.entries(currentPointFeature.features[0].properties).forEach(([key, value])=>{
            if (key != 'id' && key != 'name' && value != null) {content += '<h8>' + value + '</h8>' + '<br>' }
          });

          if (content != '') {
            this.contentPopup = content;
            content_element.innerHTML = content;
            overlay.setPosition(coord);
          };

        };
      });
    },
    onSetCurrentPoint(){

      this.$emit('clickPoint', currentPointFeature);
    },
  },
  mounted() {
    this.initMap();

  },
  watch: {
    collectionFeatures: function (v) {
      let lay = null;
      this.map.getLayers().forEach((layer) => {
        if (layer.get('name') === 'collection') {
          lay = layer;
        }
      });
      if (lay != null) {
        this.map.removeLayer(lay);
      }
      if (this.collectionFeatures != null) {
        this.map.addLayer(this.vectorLayerCollection);
        this.map.getView().setCenter(this.centerCollection);
      }
    },
    oneFeature: function (v) {
      let lay = null;
      this.map.getLayers().forEach((layer) => {
        if (layer.get('name') === 'one') {
          lay = layer;
        }
      });
      if (lay != null) {
        this.map.removeLayer(lay);
      }
      if (this.oneFeature != null) {
        this.map.addLayer(this.vectorLayerOne);
        this.map.getView().setCenter(this.centerOne);
      }
    },
  },
}
</script>

<style lang="scss">
.map {
  width: 100%;
  height: 100%;
  border: 1px solid gray;
}
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}
.ol-popup:after, .ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}
.ol-popup-closer:after {
  content: "✖";
}
</style>
