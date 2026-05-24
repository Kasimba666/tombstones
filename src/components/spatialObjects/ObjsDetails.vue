<template>
  <div class="ObjsDetails" :class="{directionColumn: modeShort}">
    <!-- Loading Spinner -->
    <div v-if="exporting" class="export-spinner-overlay">
      <div class="export-spinner-content">
        <el-icon class="spinner-icon" :size="48"><Loading /></el-icon>
        <span>Формирование карточки объекта...</span>
      </div>
    </div>

    <div class="details">
      <div class="details-actions">
        <el-button
          class="btn-close-new"
          type="primary"
          plain
          @click="goBack"
        >
          <el-icon style="font-size: 20px"><CloseBold/></el-icon>
        </el-button>
        <el-button
          size="small"
          type="success"
          plain
          :disabled="exporting"
          @click="onExportPdf"
        >
          <el-icon><Download /></el-icon>
          Карточка объекта (PDF)
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
import {useScreen} from "@/composables/useScreen.js";
import {jsPDF} from 'jspdf';
import {NotoSansRegularBase64, NotoSansBoldBase64} from '@/services/fontData.js';

export default {
  name: 'ObjsDetails',
  components: {ObjsMap},
  props: [],
  data() {
    return {
      exporting: false,
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
    async onExportPdf() {
      if (this.exporting) return;
      this.exporting = true;

      try {
        const idDetail = this.details?.find(v => v.attrName === 'id');

        // Register NotoSans font for Cyrillic support
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

        // --- Helper: check if we need a new page ---
        const checkPage = (neededSpace) => {
          if (y + neededSpace > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
        };

        // --- Title: "Карточка объекта" ---
        doc.setFontSize(18);
        doc.setFont('NotoSans', 'bold');
        doc.setTextColor(31, 78, 121);
        doc.text('Карточка объекта', pageWidth / 2, y, {align: 'center'});
        y += 10;

        // --- Object name ---
        const nameDetail = this.details?.find(v => v.attrName === 'name');
        const titleText = nameDetail?.value || `Объект #${idDetail?.value || ''}`;
        doc.setFontSize(14);
        doc.setFont('NotoSans', 'bold');
        doc.setTextColor(46, 117, 182);
        doc.text(titleText, pageWidth / 2, y, {align: 'center'});
        y += 8;

        // --- Separator line ---
        doc.setDrawColor(170, 170, 170);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        // --- Coordinates ---
        if (this.coordinatesStr) {
          checkPage(12);
          doc.setFontSize(11);
          doc.setFont('NotoSans', 'bold');
          doc.setTextColor(31, 78, 121);
          doc.text('Координаты', margin, y);
          y += 5;
          doc.setFont('NotoSans', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.text(this.coordinatesStr, margin, y);
          y += 7;
        }

        // --- Properties table ---
        if (this.details && this.details.length > 0) {
          checkPage(14);
          doc.setFontSize(11);
          doc.setFont('NotoSans', 'bold');
          doc.setTextColor(31, 78, 121);
          doc.text('Атрибуты', margin, y);
          y += 5;

          // Draw table header
          const col1X = margin;
          const col2X = margin + 55;
          const rowH = 5.5;

          doc.setFontSize(9);
          doc.setFont('NotoSans', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(31, 78, 121);
          doc.rect(col1X, y - 4, 55, rowH, 'F');
          doc.rect(col2X, y - 4, contentWidth - 55, rowH, 'F');
          doc.text('Свойство', col1X + 2, y);
          doc.text('Значение', col2X + 2, y);
          y += rowH;

          doc.setFont('NotoSans', 'normal');
          doc.setTextColor(0, 0, 0);

          const fillColors = [
            [245, 245, 245],
            [255, 255, 255],
          ];

          this.details.forEach((detail, idx) => {
            if (!!detail.value) {
              checkPage(rowH + 2);

              const valStr = String(detail.value);
              // Estimate lines needed for long text
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

        // --- All images: one per page, no category titles ---
        if (this.imgs && this.imgs.length > 0) {
          // Flatten all images from all categories
          const allImgs = [];
          for (const category of this.imgs) {
            for (const img of category.imgs) {
              allImgs.push(img);
            }
          }

          const maxImages = 20;
          const imgsToProcess = allImgs.slice(0, maxImages);

          for (const img of imgsToProcess) {
            try {
              const imgData = await this.fetchImageAsBase64(img.large);
              if (imgData) {
                // Determine image format for jsPDF
                let imgFormat = 'JPEG';
                if (imgData.type.includes('png')) imgFormat = 'PNG';
                else if (imgData.type.includes('webp')) imgFormat = 'WEBP';

                // Get actual image dimensions for proper aspect ratio
                let naturalWidth, naturalHeight;
                try {
                  const dims = await this.getImageDimensions(imgData.base64, imgFormat);
                  naturalWidth = dims.width;
                  naturalHeight = dims.height;
                } catch (e) {
                  // Fallback if dimension detection fails
                  naturalWidth = 4;
                  naturalHeight = 3;
                }

                // New page for each image
                doc.addPage();
                y = margin;

                // Calculate dimensions to fit within page while preserving aspect ratio
                const maxImgWidth = contentWidth;
                const maxImgHeight = pageHeight - margin * 2 - 15; // leave space for label

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

                // Label below image
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

        // --- Footer on last page ---
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

        // --- Save PDF ---
        const idStr = idDetail?.value || this.$route.params.id || 'unknown';
        doc.save(`kartochka_${idStr}.pdf`);
      } catch (e) {
        console.error('PDF export error:', e);
        this.$message?.error?.('Ошибка при создании PDF-документа');
      } finally {
        this.exporting = false;
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
    padding: 24px 32px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    color: hsl(210, 50%, 30%);
    box-shadow: 0 4px 20px hsla(0, 0%, 0%, 0.2);

    .spinner-icon {
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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