<template>
  <div class="ObjsMap" v-show="!!collectionFeatures">
    <div class="map-mode-toolbar">
      <el-radio-group v-model="mapViewModeLocal" size="small" @change="onModeChange">
        <el-radio-button label="Карта" value="default" />
        <el-radio-button label="Тепло" value="heatmap" />
        <el-radio-button label="Время" value="timeline" />
      </el-radio-group>
    </div>
    <div v-if="mapViewModeLocal === 'heatmap'" class="map-mode-controls">
      <span class="ctrl-label">Радиус:</span>
      <el-slider v-model="heatmapRadius" :min="2" :max="50" :step="1" size="small" style="width: 150px" />
      <span class="ctrl-value">{{ heatmapRadius }}</span>
    </div>
    <div v-if="mapViewModeLocal === 'timeline'" class="map-mode-controls">
      <el-button size="small" @click="toggleTimelinePlay">{{ timelinePlaying ? '⏸' : '▶' }}</el-button>
      <el-slider v-model="timelineRange" range :min="timelineMin" :max="timelineMax" :step="1" size="small" style="width: 200px" />
      <span class="ctrl-value">{{ timelineRange[0] }}–{{ timelineRange[1] }} ({{ timelineVisibleCount }})</span>
    </div>
    <div id="map" class="map"><div id="info"></div></div>
    <div id="popup" class="ol-popup">
      <div class="btns-control-popup">
        <button class="btn-popup-main" @click="onSetCurrentPoint">{{ popupTitle }}</button>
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      </div>
      <div id="popup-content"></div>
    </div>
  </div>
</template>
<script>
import GeoJSON from 'ol/format/GeoJSON.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer, Heatmap as HeatmapLayer} from 'ol/layer.js';
import Overlay from 'ol/Overlay.js';
import {ScaleLine} from 'ol/control.js';
import {DoubleClickZoom} from 'ol/interaction.js';
import {mapState} from 'vuex';
const LAYER_NAMES = ['collection', 'one', 'timeline-features'];
export default {
  name: 'ObjsMap',
  props: ['scheme', 'collectionFeatures', 'currentID'],
  emits: ['clickPoint'],
  data() {
    return {
      map: null, closer: null, popupTitle: '', currentPointFeature: null,
      mapViewModeLocal: 'default',
      heatmapRadius: 10,
      timelinePlaying: false, timelineInterval: null,
    };
  },
  setup() {
    const styles = {
      'PointCollection': new Style({ image: new CircleStyle({ radius: 5, fill: new Fill({color: [255,0,0,0.2]}), stroke: new Stroke({color: 'red', width: 2}) }) }),
      'PointOne': new Style({ image: new CircleStyle({ radius: 6, fill: new Fill({color: 'red'}), stroke: new Stroke({color: 'black', width: 2}) }) }),
      'Transparent': new Style({ image: new CircleStyle({ radius: 5, fill: new Fill({color: [0,0,0,0.01]}), stroke: new Stroke({color: [0,0,0,0.01], width: 0}) }) }),
      'Polygon': new Style({ stroke: new Stroke({color: 'blue', width: 2}) }),
    };
    const styleFunctionOne = (f) => styles['PointOne'];
    const styleFunctionCollection = (f) => styles['PointCollection'];
    const styleFunctionTransparent = (f) => styles['Transparent'];
    const styleFunctionPolygon = (f) => styles['Polygon'];
    return { styleFunctionOne, styleFunctionCollection, styleFunctionTransparent, styleFunctionPolygon };
  },
  computed: {
    ...mapState(['geofeatures', 'mapViewMode']),
    timelineRange: {
      get() { return this.$store.state.timelineRange; },
      set(v) { this.$store.commit('setTimelineRange', v); }
    },
    bounds() {
      if (!!this.collectionFeatures && this.collectionFeatures.features.length > 0) {
        let coords = this.collectionFeatures.features.map(v => v.geometry.coordinates);
        let cx = coords.map(v => +v[0].toFixed(0)).sort((a, b) => a > b ? 1 : -1);
        let cy = coords.map(v => +v[1].toFixed(0)).sort((a, b) => a > b ? 1 : -1);
        return [cx[0], cy[0], cx[cx.length - 1], cy[cy.length - 1]];
      }
      return null;
    },
    centerCollection() { return this.bounds ? [(this.bounds[2]+this.bounds[0])/2, (this.bounds[1]+this.bounds[3])/2] : null; },
    centerOne() {
      if (!this.oneFeature) return null;
      return [this.oneFeature.features[0].geometry.coordinates[0], this.oneFeature.features[0].geometry.coordinates[1]];
    },
    oneFeature() {
      if (!this.currentID || !this.collectionFeatures) return null;
      let f = this.collectionFeatures.features.find(v => v.properties.id === this.currentID);
      return f ? { type: this.collectionFeatures.type, name: this.collectionFeatures.name, crs: this.collectionFeatures.crs, features: [f] } : null;
    },
    vectorLayerOne() {
      if (!this.oneFeature) return null;
      return new VectorLayer({ source: new VectorSource({features: new GeoJSON().readFeatures(this.oneFeature, {})}), name: 'one', style: this.styleFunctionOne, zIndex: 10 });
    },
    vectorLayerCollection() {
      if (!this.collectionFeatures) return null;
      return new VectorLayer({ source: new VectorSource({ features: new GeoJSON().readFeatures(this.collectionFeatures, {}) }), name: 'collection', style: this.styleFunctionCollection, zIndex: 5 });
    },
    vectorLayerBorder() {
      if (!this.geofeatures[0]) return null;
      return new VectorLayer({ source: new VectorSource({ features: new GeoJSON().readFeatures(this.geofeatures[0], {}) }), name: 'border', style: this.styleFunctionPolygon, zIndex: 1 });
    },
    timelineYearValues() {
      if (!this.collectionFeatures) return [];
      return this.collectionFeatures.features.map(f => parseInt(f.properties.year)).filter(y => !isNaN(y) && y > 0);
    },
    timelineMin() { let v = this.timelineYearValues; return v.length ? Math.min(...v) : 1000; },
    timelineMax() { let v = this.timelineYearValues; return v.length ? Math.max(...v) : 2025; },
    timelineVisibleCount() {
      if (!this.collectionFeatures) return 0;
      return this.collectionFeatures.features.filter(f => { let y = parseInt(f.properties.year); return !isNaN(y) && y >= this.timelineRange[0] && y <= this.timelineRange[1]; }).length;
    },
    heatmapLayer() {
      if (!this.collectionFeatures) return null;
      let src = new VectorSource({ features: new GeoJSON().readFeatures(this.collectionFeatures, {}) });
      return new HeatmapLayer({ source: src, name: 'heatmap', blur: this.heatmapRadius * 0.75, radius: this.heatmapRadius, weight: () => 1, zIndex: 4 });
    },
  },
  methods: {
    isInteractiveLayer(layer) { return layer && LAYER_NAMES.indexOf(layer.get('name')) !== -1; },
    initMap() {
      this.map = new Map({ layers: [new TileLayer({ source: new OSM() })], target: 'map', view: new View({ center: this.centerCollection, zoom: 9 }) });
      this.map.addControl(new ScaleLine({units: 'metric', bar: true}));
      this.map.getInteractions().forEach(i => { if (i instanceof DoubleClickZoom) this.map.removeInteraction(i); });
    },
    initPointer() {
      this.map.on('pointermove', function(evt) {
        let hit = this.forEachFeatureAtPixel(evt.pixel, (f, l) => this.isInteractiveLayer(l));
        this.getTargetElement().style.cursor = hit ? 'pointer' : '';
      }.bind(this));
    },
    initTooltip() {
      const info = document.getElementById('info');
      let cur;
      this.map.on('pointermove', function(evt) {
        if (evt.dragging) { info.style.visibility = 'hidden'; cur = undefined; return; }
        const px = this.getEventPixel(evt.originalEvent);
        const feat = evt.originalEvent.target.closest('.ol-control') ? undefined
          : this.forEachFeatureAtPixel(px, (f, l) => this.isInteractiveLayer(l) ? f : undefined);
        if (feat) {
          info.style.left = 10 + px[0] + 'px'; info.style.top = px[1] + 'px';
          if (feat !== cur) { info.style.visibility = 'visible'; info.innerText = feat.get('name'); }
        } else { info.style.visibility = 'hidden'; }
        cur = feat;
      }.bind(this));
      this.map.getTargetElement().addEventListener('pointerleave', () => { cur = undefined; info.style.visibility = 'hidden'; });
    },
    initPopup() {
      const ce = document.getElementById('popup-content');
      this.closer = document.getElementById('popup-closer');
      const ov = new Overlay({ element: document.getElementById('popup'), autoPan: true, offset: [0, -10] });
      this.map.addOverlay(ov);
      this.closer.onclick = function() { ov.setPosition(undefined); this.blur(); return false; };
      const handler = (event) => {
        let feat = null;
        this.map.forEachFeatureAtPixel(event.pixel, (f, l) => { if (this.isInteractiveLayer(l)) feat = f; });
        if (feat) {
          let coord = this.map.getCoordinateFromPixel(event.pixel);
          this.currentPointFeature = { type: this.collectionFeatures.type, name: this.collectionFeatures.name, crs: this.collectionFeatures.crs, features: [] };
          let ff = this.collectionFeatures.features.find(v => v.properties.id === feat.get('id'));
          if (ff) {
            this.currentPointFeature.features.push(ff);
            this.popupTitle = feat.get('name');
            let html = '';
            Object.entries(ff.properties).forEach(([k, v]) => {
              if (k !== 'id' && k !== 'name' && v != null && v !== '') {
                let s = this.scheme.find(sc => sc.attrName === k);
                html += '<h8>' + (s ? s.title : k) + ': ' + v + '</h8><br>';
              }
            });
            if (html) { ce.innerHTML = html; ov.setPosition(coord); }
          }
        }
      };
      this.map.on('click', handler);
      this.map.on('dblclick', handler);
    },
    onSetCurrentPoint() { this.$emit('clickPoint', this.currentPointFeature.features[0].properties.id); },
    removeByName(name) { this.map.getLayers().forEach(l => { if (l.get('name') === name) this.map.removeLayer(l); }); },
    closePopup() { this.closer.onclick(); },
    addTransparentInteraction(z) {
      this.removeByName('collection');
      if (!this.map || !this.collectionFeatures) return;
      this.map.addLayer(new VectorLayer({ source: new VectorSource({ features: new GeoJSON().readFeatures(this.collectionFeatures, {}) }), name: 'collection', style: this.styleFunctionTransparent, zIndex: z || 5 }));
    },
    addCollectionLayer() {
      this.closePopup();
      if (!this.map || !this.collectionFeatures) return;
      this.removeByName('collection');
      if (!this.collectionFeatures.features.map(v=>v.properties.id).includes(this.currentID)) this.removeByName('one');
      if (this.mapViewModeLocal !== 'heatmap') this.map.addLayer(this.vectorLayerCollection);
      this.map.getView().setCenter(this.centerCollection);
    },
    addOneLayer() {
      this.closePopup();
      if (!this.map || !this.oneFeature) return;
      this.removeByName('one');
      if (this.mapViewModeLocal !== 'heatmap' && this.mapViewModeLocal !== 'timeline') {
        this.map.addLayer(this.vectorLayerOne);
        this.map.getView().setCenter(this.centerOne);
      }
    },
    onModeChange(mode) {
      this.$store.commit('setMapViewMode', mode);
      this.removeByName('heatmap'); this.removeByName('collection'); this.removeByName('one');
      this.closePopup();
      if (mode === 'default') { this.addCollectionLayer(); this.addOneLayer(); }
      else if (mode === 'heatmap') this.initHeatmapMode();
      else if (mode === 'timeline') { this.$store.commit('setTimelineRange', [this.timelineMin, this.timelineMax]); this.initTimelineMode(); }
    },
    initHeatmapMode() {
      if (!this.map || !this.collectionFeatures) return;
      this.removeByName('heatmap');
      if (this.heatmapLayer) { this.map.addLayer(this.heatmapLayer); this.map.getView().setCenter(this.centerCollection); }
      this.addTransparentInteraction(5);
    },
    updateHeatmap() {
      if (this.mapViewModeLocal !== 'heatmap') return;
      this.initHeatmapMode();
    },
    initTimelineMode() {
      if (!this.map || !this.collectionFeatures) return;
      this.removeByName('collection'); this.removeByName('one'); this.removeByName('timeline-features');
      let ff = this.collectionFeatures.features.filter(f => { let y = parseInt(f.properties.year); return !isNaN(y) && y >= this.timelineRange[0] && y <= this.timelineRange[1]; });
      if (ff.length) {
        let gd = { type: this.collectionFeatures.type, name: this.collectionFeatures.name, crs: this.collectionFeatures.crs, features: ff };
        let src = new VectorSource({ features: new GeoJSON().readFeatures(gd, {}) });
        this.map.addLayer(new VectorLayer({ source: src, name: 'timeline-features', style: this.styleFunctionCollection, zIndex: 5 }));
      }
      this.map.getView().setCenter(this.centerCollection);
    },
    updateTimeline() {
      if (this.mapViewModeLocal !== 'timeline') return;
      this.removeByName('timeline-features');
      this.initTimelineMode();
    },
    toggleTimelinePlay() { this.timelinePlaying ? this.stopTimeline() : this.startTimeline(); },
    startTimeline() {
      this.timelinePlaying = true;
      this.$store.commit('setTimelineRange', [this.timelineMin, this.timelineMin]);
      this.timelineInterval = setInterval(() => {
        if (this.timelineRange[1] >= this.timelineMax) { this.stopTimeline(); return; }
        this.$store.commit('setTimelineRange', [this.timelineMin, this.timelineRange[1] + 1]);
      }, 300);
    },
    stopTimeline() { this.timelinePlaying = false; if (this.timelineInterval) { clearInterval(this.timelineInterval); this.timelineInterval = null; } },
  },
  mounted() {
    this.initMap(); this.initPointer(); this.initTooltip(); this.initPopup();
    this.addOneLayer(); this.addCollectionLayer();
  },
  beforeUnmount() { this.stopTimeline(); },
  watch: {
    collectionFeatures() {
      if (this.mapViewModeLocal === 'default') this.addCollectionLayer();
      else if (this.mapViewModeLocal === 'heatmap') this.initHeatmapMode();
      else if (this.mapViewModeLocal === 'timeline') { this.$store.commit('setTimelineRange', [this.timelineMin, this.timelineMax]); this.initTimelineMode(); }
    },
    currentID() { if (this.mapViewModeLocal !== 'heatmap') this.addOneLayer(); },
    timelineRange() { this.updateTimeline(); },
    heatmapRadius() { this.updateHeatmap(); },
  },
};
</script>
<style lang="scss">
.ObjsMap {
  position: relative; width: 100%; height: 100%;
  .map { position: relative; width: 100%; height: 100%; border: 2px solid hsla(0,0%,50%,0.2); border-radius: 5px; }
  #map { position: relative; }
  #info { position: absolute; display: inline-block; z-index: 100; background-color: hsla(0,0%,100%,0.8); color: #333; text-align: left; border-radius: 4px; padding: 5px; left: 50%; transform: translateX(3%); visibility: hidden; pointer-events: none; }
  .ol-popup { position: absolute; background-color: hsla(0,0%,100%,0.8); box-shadow: 0 1px 4px rgba(0,0,0,0.2); padding: 5px; border-radius: 10px; border: 1px solid #ccc; bottom: 12px; left: -50px; width: auto; min-width: 100px; }
  .ol-popup:after,.ol-popup:before { top: 100%; border: solid transparent; content: " "; height: 0; width: 0; position: absolute; pointer-events: none; }
  .ol-popup:after { border-top-color: white; border-width: 10px; left: 48px; margin-left: -10px; }
  .ol-popup:before { border-top-color: #ccc; border-width: 11px; left: 48px; margin-left: -11px; }
  .ol-popup-closer:after { content: "✖"; }
  .ol-popup-closer { position: relative; text-decoration: none; }
  .btns-control-popup { position: relative; display: flex; flex-flow: row nowrap; justify-content: flex-start; align-items: flex-start;
    .btn-popup-main { height: auto; width: auto; border: 1px solid hsl(0,0%,80%); border-radius: 5px; text-align: left; word-break: normal; padding-left: 3px; padding-right: 3px;
      &:hover { box-shadow: 0 0 10px 3px rgba(0,140,186,0.5); }
    }
  }
  .map-mode-toolbar { position: absolute; top: 4px; left: 4px; z-index: 20; background-color: hsla(0,0%,100%,0.9); border-radius: 4px; padding: 2px; box-shadow: 0 1px 4px hsla(0,0%,0%,0.15); }
  .map-mode-controls { position: absolute; top: 36px; left: 4px; z-index: 20; display: flex; flex-flow: row nowrap; align-items: center; gap: 4px; background-color: hsla(0,0%,100%,0.9); border-radius: 4px; padding: 2px 6px; box-shadow: 0 1px 4px hsla(0,0%,0%,0.15);
    .ctrl-label { font-size: 11px; color: hsl(0,0%,30%); white-space: nowrap; }
    .ctrl-value { font-size: 11px; color: hsl(0,0%,30%); white-space: nowrap; }
  }
}
</style>