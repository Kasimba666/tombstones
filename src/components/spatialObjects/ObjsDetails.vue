<template>
  <div class="ObjsDetails" :class="{directionColumn: modeShort}">
    <!-- Loading Spinner with Progress -->
    <div v-if="exporting" class="export-spinner-overlay">
      <div class="export-spinner-content">
        <el-icon class="spinner-icon" :size="36"><Document /></el-icon>
        <span class="export-title">Формирование карточки объекта</span>

        <div class="export-progress-bar">
          <div class="export-progress-fill" :style="{width: exportProgress + '%'}"></div>
        </div>

        <span class="export-status">{{ exportStatus }}</span>
        <span class="export-percent">{{ exportProgress }}%</span>
      </div>
    </div>

    <div class="details">
      <div class="details-actions">
        <el-button
            size="small"
            type="success"
            plain
            :disabled="exporting"
            @click="onExportPdf"
        >
          <el-icon><Download /></el-icon>
          Экспорт PDF)
        </el-button>
        <el-button
          class="btn-close-new"
          type="primary"
          plain
          @click="goBack"
        >
          <el-icon style="font-size: 20px"><CloseBold/></el-icon>
        </el-button>
      </div>

      <div class="details-properties">
        <div v-for="(detail, i) of details" :key="i">
          <div v-if="!!detail.value && detail.titleName != '3d'">
            <b> {{ detail.titleName }}: </b> {{ detail.value }}
          </div>
        </div>
      </div>
      <div class="main-images-and-3d">
        <div class="collection-images" v-if="!!imgsCard">
          <div v-for="(v, i) of imgsCard.imgs" :key="i">
            <a :href="v.large" target="_blank">
              <div class="my-image"
                   :style="{backgroundImage: `url(${v.small})`}"
              >
              </div>
            </a>
            <div class="my-image-label">
              {{ v.label }}
            </div>
          </div>
        </div>
        <div class="sketchfab-embed-wrapper"
             v-if="!!details && sketchfabLink != null">
          <iframe allowfullscreen
                  mozallowfullscreen="true"
                  webkitallowfullscreen="true"
                  xr-spatial-tracking
                  execution-while-out-of-viewport
                  execution-while-not-rendered
                  web-share
                  :src="sketchfabLink">
          </iframe>
<!--                  allow="autoplay; fullscreen; xr-spatial-tracking"-->
        </div>
      </div>
      <div class="other-images">
        <div class="collection-images"
             v-if="!!imgsOther"
             v-for="w of imgsOther">
          <!--                <div>{{w['categoryTitle']}}</div>-->
          <div v-for="(v,i) of w.imgs" :key="i">
            <div v-if="v != null">
              <a :href="v.large" target="_blank">
                <div class="my-image"
                     :style="{backgroundImage: `url(${v.small})`}"
                >
                </div>
              </a>
              <div class="my-image-label">
                {{ v.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden mini-map for PDF export only -->
    <div class="mini-map-export-wrapper" v-if="coordinates">
      <ObjsMiniMap
          ref="exportMiniMap"
          :coords="coordinates"
          :featureGeojson="geojson"
          :pointName="pointName"
      />
    </div>

    <div class="map">
      <ObjsMap
          :collectionFeatures="collectionFeaturesForMaps"
          :currentID="currentID"
          :scheme="scheme"
          @clickPoint="setCurrentIDFromObjsMap"
      />
    </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import ObjsMap from "@/components/spatialObjects/ObjsMap.vue";
import ObjsMiniMap from "@/components/spatialObjects/ObjsMiniMap.vue";
import {useScreen} from "@/composables/useScreen.js";
import {jsPDF} from 'jspdf';
import {NotoSansRegularBase64, NotoSansBoldBase64} from '@/services/fontData.js';

export default {
  name: 'ObjsDetails',
  components: {ObjsMap, ObjsMiniMap},
  props: [],
  data() {
    return {
      exporting: false,
      exportProgress: 0,
      exportStatus: '',
    }
  },
  setup() {
    const {screen, screenBreakpoints} = useScreen();
    return {
      screen,
      screenBreakpoints
    }
  },
  computed: {
    ...mapState(['currentID', 'scheme', 'geojson']),
    ...mapGetters(['detailsGeojsonByID', 'detailsImgsByCategoriesByID', 'getURLQueryJSON', 'oneFeatureForMaps', 'collectionFeaturesForMaps']),
    ...mapMutations(['setCurrentID']),
    details() {//получить из стора
      return this.detailsGeojsonByID(this.$route.params.id);
    },
    imgs() {//получить из стора
      return this.detailsImgsByCategoriesByID(this.$route.params.id);
    },
    coordinates() {
      const findedFeature = this.geojson?.features.find(v => '' + v.properties.id === '' + this.$route.params.id);
      if (findedFeature?.geometry?.type === 'Point') {
        return findedFeature.geometry.coordinates;
      }
      return null;
    },
    pointName() {
      const nameDetail = this.details?.find(v => v.attrName === 'name');
      return nameDetail?.value || '';
    },
    coordinatesStr() {
      if (!this.coordinates) return null;
      return `Долгота: ${this.coordinates[0]}, Широта: ${this.coordinates[1]}`;
    },

    imgsCard() {
      if (!!this.imgs && this.imgs.length > 0) {
        return this.imgs.filter(v => v['category'] === 'cards')[0];

      }
    },
    imgsOther() {
      if (!!this.imgs && this.imgs.length > 0) {
        return this.imgs.filter((v) => {
          if (v['category'] != 'cards') {
            return v
          }
        });
      }
    },
    sketchfabLink() {
      if (!this.details || this.details.filter(v => v.titleName === '3d' && v.value != '' && v.value != null).length === 0) return null
      return this.details.filter(v => v.titleName === '3d')[0].value + '/embed';
    },
    modeShort() {
      return this.screen.type === 'xs' || this.screen.type === 'sm'
    },
  },
  methods: {
    setCurrentIDFromObjsMap(v) {
      this.$store.commit('setCurrentID', v);
      this.$router.push({name: 'ObjsDetails', params: {id: this.currentID}});
    },
    goBack() {
      this.$router.push({name: 'ObjsFiltersAndList', query: this.getURLQueryJSON});
    },
    async fetchImageAsBase64(url) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve({base64, type: blob.type});
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Failed to load image:', url, e);
        return null;
      }
    },
    getImageDimensions(base64, type) {
      return new Promise((resolve, reject) => {
        const mimeType = type === 'PNG' ? 'image/png' : type === 'WEBP' ? 'image/webp' : 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        const img = new Image();
        img.onload = () => {
          resolve({width: img.naturalWidth, height: img.naturalHeight});
        };
        img.onerror = reject;
        img.src = dataUrl;
      });
    },
    setExportStatus(progress, status) {
      this.exportProgress = progress;
      this.exportStatus = status;
      // Force Vue to update DOM immediately
      return new Promise(resolve => this.$nextTick(resolve));
    },
    async onExportPdf() {
      if (this.exporting) return;
      this.exporting = true;
      this.exportProgress = 0;
      this.exportStatus = 'Подготовка данных...';

      try {
        await this.$nextTick();

        const idDetail = this.details?.find(v => v.attrName === 'id');

        // --- Step 1: Init document ---
        await this.setExportStatus(5, 'Инициализация PDF-документа...');
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.addFileToVFS('NotoSans-Regular.ttf', NotoSansRegularBase64);
        doc.addFileToVFS('NotoSans-Bold.ttf', NotoSansBoldBase64);
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
        doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        const checkPage = (neededSpace) => {
          if (y + neededSpace > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
        };

        // --- Step 2: Title area ---
        await this.setExportStatus(10, 'Добавление заголовка...');

        doc.setFontSize(18);
        doc.setFont('NotoSans', 'bold');
        doc.setTextColor(31, 78, 121);
        doc.text('Карточка объекта', pageWidth / 2, y, {align: 'center'});
        y += 10;

        const nameDetail = this.details?.find(v => v.attrName === 'name');
        const titleText = nameDetail?.value || `Объект #${idDetail?.value || ''}`;
        doc.setFontSize(14);
        doc.setFont('NotoSans', 'bold');
        doc.setTextColor(46, 117, 182);
        doc.text(titleText, pageWidth / 2, y, {align: 'center'});
        y += 8;

        doc.setDrawColor(170, 170, 170);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        // --- Step 3: Properties table ---
        await this.setExportStatus(20, 'Формирование таблицы атрибутов...');
        if (this.details && this.details.length > 0) {
          const col1X = margin;
          const col2X = margin + 55;
          const rowH = 5.5;

          doc.setFont('NotoSans', 'normal');
          doc.setTextColor(0, 0, 0);

          const fillColors = [
            [245, 245, 245],
            [255, 255, 255],
          ];

          let rowIdx = 0;

          if (this.coordinates) {
            checkPage(rowH + 2);
            const coordStr = `Долгота: ${this.coordinates[0]}, Широта: ${this.coordinates[1]}`;
            const valStr = String(coordStr);
            const lineH = 4;
            const maxChars = Math.floor((contentWidth - 55 - 4) / 2.2);
            const lines = [];
            for (let i = 0; i < valStr.length; i += maxChars) {
              lines.push(valStr.substring(i, i + maxChars));
            }
            const neededH = Math.max(rowH, lines.length * lineH + 1);
            checkPage(neededH + 1);

            doc.setFillColor(...fillColors[rowIdx % 2]);
            doc.rect(col1X, y - 4, 55, neededH, 'F');
            doc.rect(col2X, y - 4, contentWidth - 55, neededH, 'F');
            doc.setFont('NotoSans', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text('Координаты', col1X + 2, y + 0.5);
            doc.text(lines, col2X + 2, y + 0.5);
            y += neededH;
            rowIdx++;
          }

          this.details.forEach((detail, idx) => {
            if (!!detail.value) {
              checkPage(rowH + 2);

              const valStr = String(detail.value);
              const lineH = 4;
              const maxChars = Math.floor((contentWidth - 55 - 4) / 2.2);
              const lines = [];
              for (let i = 0; i < valStr.length; i += maxChars) {
                lines.push(valStr.substring(i, i + maxChars));
              }
              const neededH = Math.max(rowH, lines.length * lineH + 1);

              checkPage(neededH + 1);

              doc.setFillColor(...fillColors[idx % 2]);
              doc.rect(col1X, y - 4, 55, neededH, 'F');
              doc.rect(col2X, y - 4, contentWidth - 55, neededH, 'F');

              doc.setFont('NotoSans', 'normal');
              doc.setFontSize(9);
              doc.setTextColor(0, 0, 0);
              doc.text(detail.titleName, col1X + 2, y + 0.5);

              doc.text(lines, col2X + 2, y + 0.5);

              y += neededH;
            }
          });

          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.2);
          doc.line(col1X, y, pageWidth - margin, y);
          y += 4;
        }

        // --- Step 4: Mini-map image (portrait A4, full page) ---
        if (this.coordinates) {
          await this.setExportStatus(25, 'Захват мини-карты...');

          const miniMapWrapper = this.$el?.querySelector('.mini-map-export-wrapper');
          const miniMapRef = this.$refs.exportMiniMap;

          if (miniMapWrapper && miniMapRef && miniMapRef.map) {
            // Temporarily move wrapper on-screen so OSM tiles render
            const origLeft = miniMapWrapper.style.left;
            miniMapWrapper.style.left = '0';
            miniMapWrapper.style.top = '0';

            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
              const olMap = miniMapRef.map;
              const canvasEl = olMap.getTargetElement().querySelector('canvas');
              if (canvasEl && canvasEl.width > 0) {
                const mapBase64 = canvasEl.toDataURL('image/png');
                const cw = canvasEl.width;
                const ch = canvasEl.height;

                // Portrait A4 page: 210 x 297 mm — map fills entire page
                doc.addPage('p', 'mm', 'a4');
                const pPageW = doc.internal.pageSize.getWidth();   // 210
                const pPageH = doc.internal.pageSize.getHeight();  // 297

                // Stretch canvas to fill exactly the page, cropping if needed
                // Canvas aspect: 708/1000 ≈ 0.708, A4: 210/297 ≈ 0.707 — near identical
                doc.addImage(mapBase64, 'PNG', 0, 0, pPageW, pPageH, undefined, 'FAST');
              }
            } catch (e) {
              console.warn('Failed to capture mini-map for PDF:', e);
            } finally {
              // Move wrapper back off-screen
              miniMapWrapper.style.left = origLeft || '-10000px';
            }
          }
        }

        // --- Step 5: Images ---
        if (this.imgs && this.imgs.length > 0) {
          const allImgs = [];
          for (const category of this.imgs) {
            for (const img of category.imgs) {
              allImgs.push(img);
            }
          }

          const maxImages = 20;
          const imgsToProcess = allImgs.slice(0, maxImages);
          const imgTotal = imgsToProcess.length;

          for (let imgIdx = 0; imgIdx < imgTotal; imgIdx++) {
            const img = imgsToProcess[imgIdx];
            if (imgIdx > 0) {
              // Update progress for each image download
              const imgProgress = 20 + Math.round(((imgIdx) / imgTotal) * 60);
              await this.setExportStatus(imgProgress, `Загрузка изображения ${imgIdx + 1} из ${imgTotal}...`);
            } else if (imgTotal > 0) {
              await this.setExportStatus(25, `Загрузка изображения 1 из ${imgTotal}...`);
            }

            try {
              const imgData = await this.fetchImageAsBase64(img.large);
              if (imgData) {
                // Update for processing
                const processProgress = 20 + Math.round(((imgIdx + 0.5) / imgTotal) * 60);
                await this.setExportStatus(processProgress, `Вставка изображения ${imgIdx + 1} из ${imgTotal}...`);

                let imgFormat = 'JPEG';
                if (imgData.type.includes('png')) imgFormat = 'PNG';
                else if (imgData.type.includes('webp')) imgFormat = 'WEBP';

                let naturalWidth, naturalHeight;
                try {
                  const dims = await this.getImageDimensions(imgData.base64, imgFormat);
                  naturalWidth = dims.width;
                  naturalHeight = dims.height;
                } catch (e) {
                  naturalWidth = 4;
                  naturalHeight = 3;
                }

                doc.addPage();
                y = margin;

                const maxImgWidth = contentWidth;
                const maxImgHeight = pageHeight - margin * 2 - 15;

                let imgWidth = maxImgWidth;
                let imgHeight = (imgWidth * naturalHeight) / naturalWidth;

                if (imgHeight > maxImgHeight) {
                  imgHeight = maxImgHeight;
                  imgWidth = (imgHeight * naturalWidth) / naturalHeight;
                }

                const xOffset = (pageWidth - imgWidth) / 2;
                const imgY = y;

                doc.addImage(
                  imgData.base64,
                  imgFormat,
                  xOffset,
                  imgY,
                  imgWidth,
                  imgHeight,
                  undefined,
                  'FAST'
                );

                if (img.label) {
                  y = imgY + imgHeight + 5;
                  checkPage(10);
                  doc.setFontSize(9);
                  doc.setFont('NotoSans', 'normal');
                  doc.setTextColor(102, 102, 102);
                  doc.text(img.label, pageWidth / 2, y, {align: 'center', maxWidth: contentWidth});
                }
              }
            } catch (e) {
              console.warn('Failed to embed image:', img.large, e);
            }
          }

          if (allImgs.length > maxImages) {
            doc.addPage();
            y = margin;
            doc.setFontSize(10);
            doc.setFont('NotoSans', 'normal');
            doc.setTextColor(153, 153, 153);
            doc.text(`... и ещё ${allImgs.length - maxImages} изображений`, pageWidth / 2, y, {align: 'center'});
          }
        }

        // --- Step 6: Finalize ---
        await this.setExportStatus(90, 'Завершение документа...');

        checkPage(10);
        doc.setFontSize(8);
        doc.setFont('NotoSans', 'normal');
        doc.setTextColor(170, 170, 170);
        doc.text(
          `Сформировано ${new Date().toLocaleDateString('ru-RU')}`,
          pageWidth / 2,
          pageHeight - margin,
          {align: 'center'}
        );

        await this.setExportStatus(95, 'Сохранение файла...');

        const idStr = idDetail?.value || this.$route.params.id || 'unknown';
        doc.save(`kartochka_${idStr}.pdf`);

        await this.setExportStatus(100, 'Готово!');
      } catch (e) {
        console.error('PDF export error:', e);
        this.$message?.error?.('Ошибка при создании PDF-документа');
      } finally {
        // Small delay so user sees 100%
        const _ = await new Promise(resolve => setTimeout(resolve, 300));
        this.exporting = false;
        this.exportProgress = 0;
        this.exportStatus = '';
      }
    },
  },
  mounted() {
    if (this.details === null) {
      alert('Указан неверный адрес: ' + this.$route.path);
      this.goBack();
    } else {
      this.$store.commit('setCurrentID', this.$route.params.id.toString());

    }
  },
}
</script>

<style lang="scss">
.ObjsDetails {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 5px;
  &.directionColumn {
    flex-direction: column;
  }

  .export-spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: hsla(0, 0%, 0%, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .export-spinner-content {
    background-color: hsl(0, 0%, 100%);
    padding: 28px 36px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    color: hsl(210, 50%, 30%);
    box-shadow: 0 4px 24px hsla(0, 0%, 0%, 0.25);
    min-width: 320px;

    .spinner-icon {
      animation: pulse 1.2s ease-in-out infinite;
    }

    .export-title {
      font-weight: 600;
      font-size: 17px;
    }

    .export-progress-bar {
      width: 100%;
      height: 8px;
      background-color: hsl(210, 30%, 92%);
      border-radius: 4px;
      overflow: hidden;
      margin: 4px 0 2px;
    }

    .export-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, hsl(210, 60%, 50%), hsl(160, 60%, 45%));
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .export-status {
      font-size: 13px;
      color: hsl(210, 20%, 50%);
      text-align: center;
      line-height: 1.3;
    }

    .export-percent {
      font-size: 14px;
      font-weight: 700;
      color: hsl(210, 60%, 40%);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .details-actions {
    position: relative;
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    align-items: center;
    gap: 5px;
    padding: 2px 0;
  }

  .btn-close-new {
    width: 20px;
    height: 20px;
  }

  .btn-close {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 10px;
    right: 10px;
    border: 1px solid grey;
    background-color: white;
    z-index: 10;
  }

  .details {
    position: relative;
    width: auto;
    min-width: 384px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    flex: 1;

    .details-properties {
      text-align: start;
      padding: 5px;
      border: 2px solid hsla(0, 0%, 50%, 0.2);
      border-radius: 5px;
    }

    .collection-images {
      position: relative;
      height: auto;
      width: auto;
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 10px;
      padding: 5px;

      .my-image {
        flex: 1 1 auto;
        width: 150px;
        height: 200px;
        min-width: 30px;
        min-height: 60px;
        background-color: white;
        border-radius: 10px;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;

        &:hover {
          box-shadow: 0 0 10px 3px rgba(0, 140, 186, 0.5);
        }
      }

      .my-image-label {
        text-align: center;
      }
    }

    .main-images-and-3d {
      width: 100%;
      height: auto;
      display: flex;
      flex-flow: row wrap;
      gap: 5px;
      justify-content: flex-start;
      align-items: flex-start;
    }

    .sketchfab-embed-wrapper {
      align-self: center;
      padding: 5px;
    }

    .other-images {

    }
  }

  .mini-map-export-wrapper {
    position: fixed;
    left: -10000px;
    top: 0;
    width: 708px;
    height: 1000px;
  }

  .map {
    //width: 70%;
    width: auto;
    height: 90dvh;
    min-width: 384px;
    flex: 1;
    margin-top: 0px;
  }
}
</style>