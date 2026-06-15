<template>
  <div ref="obsmmap" :class="['ObjsMap', {'is-fullscreen': isMapFullscreen}]" v-show="!!collectionFeatures">
    <el-tooltip :content="isMapFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'" placement="right" :show-after="500">
      <el-button class="fullscreen-btn" size="small" circle @click="toggleFullscreen">
        {{ isMapFullscreen ? '✕' : '⛶' }}
      </el-button>
    </el-tooltip>
    <el-tooltip content="Экспорт карты в JPG" placement="left" :show-after="500">
      <el-button class="export-jpg-btn" size="small" @click="onExportJPG">
        <el-icon><Download /></el-icon>
        Экспорт JPG
      </el-button>
    </el-tooltip>
    <div class="map-mode-toolbar">
      <el-radio-group v-model="mapViewModeLocal" size="small" @change="onModeChange">
        <el-radio-button label="Карта" value="default" />
        <el-radio-button label="Тепло" value="heatmap" />
        <el-radio-button label="Зоны" value="zones" />
        <el-radio-button label="Время" value="timeline" />
      </el-radio-group>
    </div>
    <div v-if="mapViewModeLocal === 'heatmap'" class="map-mode-controls heatmap-controls">
      <span class="ctrl-label">Палитра:</span>
        <el-select v-model="heatmapGradientKey" size="small" style="width: 120px" popper-class="heatmap-gradient-popper">
        <el-option v-for="g in heatmapGradientPresets" :key="g.key" :label="g.label" :value="g.key">
          <div class="gradient-option"><div class="gradient-preview" :style="{background: g.css}"></div><span class="gradient-label">{{ g.label }}</span></div>
        </el-option>
      </el-select>
      <span class="ctrl-label">R:</span>
      <el-slider v-model="heatmapRadius" :min="5" :max="50" :step="1" size="small" style="width: 80px" />
      <span class="ctrl-value">{{ heatmapRadius }}</span>
      <span class="ctrl-label">B:</span>
      <el-slider v-model="heatmapBlur" :min="5" :max="100" :step="5" size="small" style="width: 80px" />
      <span class="ctrl-value">{{ heatmapBlur }}</span>
      <span class="ctrl-label">I:</span>
      <el-slider v-model="heatmapIntensity" :min="0.1" :max="2.0" :step="0.1" size="small" style="width: 80px" />
      <span class="ctrl-value">{{ heatmapIntensity.toFixed(1) }}x</span>
    </div>
    <div v-if="mapViewModeLocal === 'zones'" class="map-mode-controls zone-controls">
      <span class="ctrl-label">Радиус (м):</span>
      <el-slider v-model="zoneRadius" :min="100" :max="10000" :step="100" size="small" style="width: 120px" />
      <span class="ctrl-value">{{ zoneRadius }}м</span>
      <el-checkbox v-model="zoneMerge" size="small" @change="updateZones">Объединить</el-checkbox>
      <span class="ctrl-label">Заливка:</span>
      <el-color-picker v-model="zoneFillColor" size="small" @change="updateZones" />
      <span class="ctrl-label">Контур:</span>
      <el-color-picker v-model="zoneStrokeColor" size="small" @change="updateZones" />
    </div>
    <div v-if="mapViewModeLocal === 'timeline'" class="map-mode-controls">
      <el-button size="small" @click="toggleTimelinePlay">{{ timelinePlaying ? '⏸' : '▶' }}</el-button>
      <el-slider v-model="timelineRange" range :min="timelineMin" :max="timelineMax" :step="1" size="small" style="width: 200px" />
      <span class="ctrl-value">{{ timelineRange[0] }}–{{ timelineRange[1] }} вв. ({{ timelineVisibleCount }})</span>
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
import {Circle as CircleGeometry} from 'ol/geom.js';
import Feature from 'ol/Feature.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer, Heatmap as HeatmapLayer} from 'ol/layer.js';
import Overlay from 'ol/Overlay.js';
import {ScaleLine} from 'ol/control.js';
import {DoubleClickZoom} from 'ol/interaction.js';
import {mapState} from 'vuex';
import * as turf from '@turf/turf';
const LAYER_NAMES = ['collection', 'one', 'timeline-features', 'zones-features'];
export default {
  name: 'ObjsMap',
  props: ['scheme', 'collectionFeatures', 'currentID'],
  emits: ['clickPoint'],
  data() {
    return {
      map: null, closer: null, popupTitle: '', currentPointFeature: null,
      mapViewModeLocal: 'default',
      savedViewCenter: null,
      savedViewZoom: 9,
      heatmapRadius: 36,
      heatmapBlur: 75,
      heatmapIntensity: 1.5,
      heatmapGradientKey: 'classic',
      heatmapLayerInstance: null,
      heatmapGradientPresets: [
        { key: 'red-yellow', label: 'Красный → Жёлтый', css: 'linear-gradient(to right, #ff0000, #ffff00)', colors: ['rgba(255,0,0,1)', 'rgba(255,128,0,1)', 'rgba(255,255,0,1)'] },
        { key: 'classic', label: 'Классика', css: 'linear-gradient(to right, #0000ff, #00aaff, #00ff00, #ffff00, #ff0000)', colors: ['rgba(0,0,255,1)', 'rgba(0,170,255,1)', 'rgba(0,255,0,1)', 'rgba(255,255,0,1)', 'rgba(255,0,0,1)'] },
        { key: 'hot', label: 'Горячий', css: 'linear-gradient(to right, #000000, #550000, #cc2200, #ff7700, #ffff00, #ffffff)', colors: ['rgba(0,0,0,1)', 'rgba(85,0,0,1)', 'rgba(204,34,0,1)', 'rgba(255,119,0,1)', 'rgba(255,255,0,1)', 'rgba(255,255,255,1)'] },
        { key: 'cool', label: 'Холодный', css: 'linear-gradient(to right, #e0f8ff, #80b8e8, #2068b0, #001850)', colors: ['rgba(224,248,255,1)', 'rgba(128,184,232,1)', 'rgba(32,104,176,1)', 'rgba(0,24,80,1)'] },
        { key: 'viridis', label: 'Viridis', css: 'linear-gradient(to right, #440154, #31688e, #35b779, #fde725)', colors: ['rgba(68,1,84,1)', 'rgba(49,104,142,1)', 'rgba(53,183,121,1)', 'rgba(253,231,37,1)'] },
        { key: 'magma', label: 'Magma', css: 'linear-gradient(to right, #000004, #4a0e6b, #ed6925, #fcffa4)', colors: ['rgba(0,0,4,1)', 'rgba(74,14,107,1)', 'rgba(237,105,37,1)', 'rgba(252,255,164,1)'] },
        { key: 'fire', label: 'Огонь', css: 'linear-gradient(to right, #000000, #7a1208, #dd4400, #ff8c00, #ffff00)', colors: ['rgba(0,0,0,1)', 'rgba(122,18,8,1)', 'rgba(221,68,0,1)', 'rgba(255,140,0,1)', 'rgba(255,255,0,1)'] },
      ],
      isMapFullscreen: false,
      timelinePlaying: false, timelineInterval: null,
      zoneRadius: 5000,
      zoneMerge: true,
      zoneFillColor: 'rgba(57,139,57,0.3)',
      zoneStrokeColor: 'rgba(40,105,40,0.8)',
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
    timelineCenturyValues() {
      if (!this.collectionFeatures) return [];
      return this.collectionFeatures.features.map(f => parseInt(f.properties.date)).filter(c => !isNaN(c) && c > 0);
    },
    timelineMin() { let v = this.timelineCenturyValues; return v.length ? Math.min(...v) : 10; },
    timelineMax() { let v = this.timelineCenturyValues; return v.length ? Math.max(...v) : 21; },
    timelineVisibleCount() {
      if (!this.collectionFeatures) return 0;
      return this.collectionFeatures.features.filter(f => { let c = parseInt(f.properties.date); return !isNaN(c) && c >= this.timelineRange[0] && c <= this.timelineRange[1]; }).length;
    },
    heatmapGradient() {
      let preset = this.heatmapGradientPresets.find(g => g.key === this.heatmapGradientKey);
      return preset ? preset.colors : this.heatmapGradientPresets[0].colors;
    },
    heatmapLayer() {
      if (!this.collectionFeatures) return null;
      let src = new VectorSource({ features: new GeoJSON().readFeatures(this.collectionFeatures, {}) });
      let intensity = this.heatmapIntensity;
      return new HeatmapLayer({ source: src, name: 'heatmap', blur: this.heatmapBlur, radius: this.heatmapRadius, gradient: this.heatmapGradient, weight: () => intensity, zIndex: 3 });
    },
  },
  methods: {
    isInteractiveLayer(layer) { return layer && LAYER_NAMES.indexOf(layer.get('name')) !== -1; },
    initMap() {
      this.map = new Map({ layers: [new TileLayer({ source: new OSM() })], target: 'map', view: new View({ center: this.centerCollection, zoom: 9 }) });
      this.map.addControl(new ScaleLine({units: 'metric', bar: true}));
      this.map.getInteractions().forEach(i => { if (i instanceof DoubleClickZoom) this.map.removeInteraction(i); });
      this.map.getView().on('change', () => {
        this.savedViewCenter = this.map.getView().getCenter();
        this.savedViewZoom = this.map.getView().getZoom();
      });
    },
    restoreView() {
      if (this.map && this.savedViewCenter) {
        this.map.getView().setCenter(this.savedViewCenter);
        this.map.getView().setZoom(this.savedViewZoom);
      }
    },
    initPointer() {
      const map = this.map;
      this.map.on('pointermove', function(evt) {
        let hit = map.forEachFeatureAtPixel(evt.pixel, (f, l) => map.getLayers().getArray().indexOf(l) !== -1);
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
      });
    },
    initTooltip() {
      const map = this.map;
      const info = document.getElementById('info');
      let cur;
      map.on('pointermove', function(evt) {
        if (evt.dragging) { info.style.visibility = 'hidden'; cur = undefined; return; }
        const px = map.getEventPixel(evt.originalEvent);
        const feat = evt.originalEvent.target.closest('.ol-control') ? undefined
          : map.forEachFeatureAtPixel(px, (f, l) => f);
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
    removeByName(name) {
      if (!this.map) return;
      let toRemove = this.map.getLayers().getArray().filter(l => l.get('name') === name);
      toRemove.forEach(l => this.map.removeLayer(l));
    },
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
      if (this.mapViewModeLocal !== 'heatmap' && this.mapViewModeLocal !== 'zones') this.map.addLayer(this.vectorLayerCollection);
      this.restoreView();
    },
    addOneLayer() {
      this.closePopup();
      if (!this.map || !this.oneFeature) return;
      this.removeByName('one');
      if (this.mapViewModeLocal !== 'heatmap' && this.mapViewModeLocal !== 'timeline' && this.mapViewModeLocal !== 'zones') {
        this.map.addLayer(this.vectorLayerOne);
        this.restoreView();
      }
    },
    removeAllFeatureLayers() {
      this.removeByName('heatmap'); this.removeByName('collection'); this.removeByName('one'); this.removeByName('timeline-features'); this.removeByName('zones-features');
    },
    onModeChange(mode) {
      this.$store.commit('setMapViewMode', mode);
      this.removeAllFeatureLayers();
      this.closePopup();
      if (mode === 'default') { this.addCollectionLayer(); this.addOneLayer(); }
      else if (mode === 'heatmap') this.initHeatmapMode();
      else if (mode === 'zones') this.initZonesMode();
      else if (mode === 'timeline') { this.$store.commit('setTimelineRange', [this.timelineMin, this.timelineMax]); this.initTimelineMode(); }
    },
    initHeatmapMode() {
      if (!this.map || !this.collectionFeatures) return;
      this.removeAllFeatureLayers();
      this.heatmapLayerInstance = this.heatmapLayer;
      if (this.heatmapLayerInstance) { this.map.addLayer(this.heatmapLayerInstance); this.restoreView(); }
      this.removeByName('collection');
      this.map.addLayer(new VectorLayer({ source: new VectorSource({ features: new GeoJSON().readFeatures(this.collectionFeatures, {}) }), name: 'collection', style: this.styleFunctionCollection, zIndex: 6 }));
    },
    updateHeatmap() {
      if (this.mapViewModeLocal !== 'heatmap') return;
      this.initHeatmapMode();
    },
    initTimelineMode() {
      if (!this.map || !this.collectionFeatures) return;
      this.removeAllFeatureLayers();
      let ff = this.collectionFeatures.features.filter(f => { let c = parseInt(f.properties.date); return !isNaN(c) && c >= this.timelineRange[0] && c <= this.timelineRange[1]; });
      if (ff.length) {
        let gd = { type: this.collectionFeatures.type, name: this.collectionFeatures.name, crs: this.collectionFeatures.crs, features: ff };
        let src = new VectorSource({ features: new GeoJSON().readFeatures(gd, {}) });
        this.map.addLayer(new VectorLayer({ source: src, name: 'timeline-features', style: this.styleFunctionCollection, zIndex: 5 }));
      }
      this.restoreView();
    },
    updateTimeline() {
      if (this.mapViewModeLocal !== 'timeline') return;
      this.removeByName('timeline-features');
      this.initTimelineMode();
    },
    initZonesMode() {
      if (!this.map || !this.collectionFeatures) return;
      this.removeAllFeatureLayers();
      try {
        const features = this.collectionFeatures.features;
        if (!features || features.length === 0) return;
        const olFeatures = new GeoJSON().readFeatures(this.collectionFeatures);
        const zoneFeatures = [];
        olFeatures.forEach(f => {
          if (!f.getGeometry() || f.getGeometry().getType() !== 'Point') return;
          zoneFeatures.push(new Feature({ geometry: new CircleGeometry(f.getGeometry().getCoordinates(), this.zoneRadius) }));
        });
        if (zoneFeatures.length) {
          const zoneStyle = new Style({
            fill: new Fill({ color: this.zoneFillColor }),
            stroke: new Stroke({ color: this.zoneStrokeColor, width: 2 }),
          });
          const src = new VectorSource({ features: zoneFeatures });
          this.map.addLayer(new VectorLayer({ source: src, name: 'zones-features', style: zoneStyle, zIndex: 4 }));
        }
      } catch (e) {
        console.error('initZonesMode error:', e);
      }
      this.map.addLayer(new VectorLayer({ source: new VectorSource({ features: new GeoJSON().readFeatures(this.collectionFeatures, {}) }), name: 'collection', style: this.styleFunctionCollection, zIndex: 6 }));
      this.restoreView();
      this.map.updateSize();
    },
    updateZones() {
      if (this.mapViewModeLocal !== 'zones') return;
      this.initZonesMode();
    },
    toggleTimelinePlay() { this.timelinePlaying ? this.stopTimeline() : this.startTimeline(); },
    startTimeline() {
      this.timelinePlaying = true;
      this.$store.commit('setTimelineRange', [this.timelineMin, this.timelineMin]);
      this.timelineInterval = setInterval(() => {
        if (this.timelineRange[1] >= this.timelineMax) {
          this.$store.commit('setTimelineRange', [this.timelineMin, this.timelineMin]);
        } else {
          this.$store.commit('setTimelineRange', [this.timelineMin, this.timelineRange[1] + 1]);
        }
      }, 600);
    },
    toggleFullscreen() {
      this.isMapFullscreen = !this.isMapFullscreen;
      if (this.map) { setTimeout(() => this.map.updateSize(), 100); }
    },
    stopTimeline() { this.timelinePlaying = false; if (this.timelineInterval) { clearInterval(this.timelineInterval); this.timelineInterval = null; } },
    onExportJPG() {
      if (!this.map) return;
      const map = this.map;
      const size = map.getSize();
      if (!size || size[0] === 0 || size[1] === 0) {
        this.$message?.warning?.('Карта не загружена');
        return;
      }
      map.renderSync();
      const captureMap = () => {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = size[0];
        exportCanvas.height = size[1];
        const ctx = exportCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        const viewport = map.getTargetElement().querySelector('.ol-viewport');
        if (viewport) {
          const canvases = viewport.querySelectorAll('canvas');
          canvases.forEach(canvas => {
            if (canvas.width === 0 || canvas.height === 0) return;
            const opacity = canvas.style.opacity;
            if (opacity) ctx.globalAlpha = Number(opacity);
            const transform = canvas.style.transform;
            if (transform && transform !== 'none') {
              const matrix = transform.match(/^matrix\(([^\(]*)\)$/);
              if (matrix) {
                const v = matrix[1].split(',').map(Number);
                ctx.setTransform(v[0], v[1], v[2], v[3], v[4], v[5]);
              }
            }
            ctx.drawImage(canvas, 0, 0);
            ctx.globalAlpha = 1;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
          });
        }
        if (this.mapViewModeLocal === 'heatmap' && this.collectionFeatures && this.collectionFeatures.features) {
          this.renderHeatmapForExport(ctx, size[0], size[1]);
        }
        const link = document.createElement('a');
        link.download = 'map_export_' + new Date().toISOString().slice(0, 10) + '.jpg';
        link.href = exportCanvas.toDataURL('image/jpeg', 0.92);
        link.click();
      };
      requestAnimationFrame(() => { requestAnimationFrame(captureMap); });
    },
    renderHeatmapForExport(ctx, w, h) {
      const map = this.map;
      const view = map.getView();
      const resolution = view.getResolution();
      if (!resolution || !this.collectionFeatures) return;
      const features = this.collectionFeatures.features;
      const radius = this.heatmapRadius;
      const blur = this.heatmapBlur;
      const intensity = this.heatmapIntensity;
      const preset = this.heatmapGradientPresets.find(g => g.key === this.heatmapGradientKey);
      const presetColors = preset ? preset.colors : this.heatmapGradientPresets[0].colors;
      const parseColor = (c) => {
        let m;
        if ((m = c.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/))) {
          return { r: +m[1], g: +m[2], b: +m[3] };
        }
        if (c.startsWith('#')) {
          const hex = c.replace('#', '');
          return { r: parseInt(hex.substr(0, 2), 16), g: parseInt(hex.substr(2, 2), 16), b: parseInt(hex.substr(4, 2), 16) };
        }
        return { r: 0, g: 0, b: 0 };
      };
      const gradientStops = presetColors.map(parseColor);
      const lut = new Uint8Array(256 * 3);
      for (let i = 0; i < 256; i++) {
        const norm = i / 255;
        const idx = norm * (gradientStops.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.min(lo + 1, gradientStops.length - 1);
        const frac = idx - lo;
        lut[i * 3]     = Math.round(gradientStops[lo].r + (gradientStops[hi].r - gradientStops[lo].r) * frac);
        lut[i * 3 + 1] = Math.round(gradientStops[lo].g + (gradientStops[hi].g - gradientStops[lo].g) * frac);
        lut[i * 3 + 2] = Math.round(gradientStops[lo].b + (gradientStops[hi].b - gradientStops[lo].b) * frac);
      }
      const heatCanvas = document.createElement('canvas');
      heatCanvas.width = w;
      heatCanvas.height = h;
      const hctx = heatCanvas.getContext('2d');
      hctx.globalCompositeOperation = 'lighter';
      features.forEach(f => {
        if (!f.geometry || f.geometry.type !== 'Point') return;
        const px = map.getPixelFromCoordinate(f.geometry.coordinates);
        if (!px) return;
        const r = radius * intensity;
        const g = hctx.createRadialGradient(px[0], px[1], 0, px[0], px[1], r);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        hctx.fillStyle = g;
        hctx.fillRect(px[0] - r, px[1] - r, r * 2, r * 2);
      });
      const blurCanvas = document.createElement('canvas');
      blurCanvas.width = w;
      blurCanvas.height = h;
      const bctx = blurCanvas.getContext('2d');
      bctx.filter = 'blur(' + blur + 'px)';
      bctx.drawImage(heatCanvas, 0, 0);
      const heatData = bctx.getImageData(0, 0, w, h);
      const heatPix = heatData.data;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      const octx = offCanvas.getContext('2d');
      const offData = octx.createImageData(w, h);
      const offPix = offData.data;
      for (let i = 0; i < heatPix.length; i += 4) {
        const alpha = heatPix[i + 3];
        if (alpha > 0) {
          const a = Math.min(alpha, 255);
          offPix[i]     = lut[a * 3];
          offPix[i + 1] = lut[a * 3 + 1];
          offPix[i + 2] = lut[a * 3 + 2];
          offPix[i + 3] = alpha > 255 ? 255 : alpha;
        }
      }
      octx.putImageData(offData, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(offCanvas, 0, 0);
    },
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
      else if (this.mapViewModeLocal === 'zones') this.initZonesMode();
      else if (this.mapViewModeLocal === 'timeline') { this.$store.commit('setTimelineRange', [this.timelineMin, this.timelineMax]); this.initTimelineMode(); }
    },
    currentID() { if (this.mapViewModeLocal !== 'heatmap') this.addOneLayer(); },
    timelineRange() { this.updateTimeline(); },
    heatmapRadius() { this.updateHeatmap(); },
    heatmapBlur() { this.updateHeatmap(); },
    heatmapIntensity() { this.updateHeatmap(); },
    heatmapGradientKey() { this.updateHeatmap(); },
    zoneRadius() { this.updateZones(); },
    zoneFillColor() { this.updateZones(); },
    zoneStrokeColor() { this.updateZones(); },
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
  .map-mode-toolbar { position: absolute; top: 4px; left: 30px; z-index: 20; background-color: hsla(0,0%,100%,0.9); border-radius: 4px; padding: 2px; box-shadow: 0 1px 4px hsla(0,0%,0%,0.15); }
  .map-mode-controls { position: absolute; top: 36px; left: 30px; z-index: 20; display: flex; flex-flow: row nowrap; align-items: center; gap: 4px; background-color: hsla(0,0%,100%,0.9); border-radius: 4px; padding: 2px 6px; box-shadow: 0 1px 4px hsla(0,0%,0%,0.15);
    .ctrl-label { font-size: 11px; color: hsl(0,0%,30%); white-space: nowrap; }
    .ctrl-value { font-size: 11px; color: hsl(0,0%,30%); white-space: nowrap; }
  }
  .gradient-option { display: flex; align-items: center; gap: 6px; }
  .gradient-preview { width: 90px; height: 12px; border-radius: 2px; border: 1px solid hsl(0,0%,80%); }
  .gradient-label { font-size: 12px; color: hsl(0,0%,15%); white-space: nowrap; }
  .fullscreen-btn { position: absolute; top: 7px; left: 4px; z-index: 25; }
  .export-jpg-btn { position: absolute; top: 7px; right: 4px; z-index: 25; }
  .ol-zoom { top: 32px !important; left: 5px !important; }
  &.is-fullscreen {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; background: hsl(0,0%,100%);
    .map { width: 100%; height: 100%; }
  }
}
.heatmap-gradient-popper {
  z-index: 10001 !important;
}
</style>
