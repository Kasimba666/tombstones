<template>
  <div class="ObjsDetails" :class="{directionColumn: modeShort}">
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
          @click="onExportWord"
        >
          <el-icon><Download /></el-icon>
          Экспорт Word
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
import {Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel} from 'docx';
import {saveAs} from 'file-saver';

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
      // let query={filters: JSON.stringify(this.URLQuery)};
      // console.log('URLQueryJSON', this.URLQueryJSON);
      this.$router.push({name: 'ObjsFiltersAndList', query: this.getURLQueryJSON});
      // this.$router.push({name: 'ObjsFiltersAndList', query: query});
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
    async onExportWord() {
      if (this.exporting) return;
      this.exporting = true;

      try {
        const children = [];

        // Title
        children.push(new Paragraph({
          children: [new TextRun({
            text: 'Паспорт объекта',
            bold: true,
            size: 48,
            color: '1F4E79',
          })],
          alignment: AlignmentType.CENTER,
          spacing: {after: 400},
        }));

        // Object ID / Name subtitle
        const nameDetail = this.details?.find(v => v.attrName === 'name');
        const idDetail = this.details?.find(v => v.attrName === 'id');
        const titleText = nameDetail?.value || `Объект #${idDetail?.value || ''}`;
        children.push(new Paragraph({
          children: [new TextRun({
            text: titleText,
            bold: true,
            size: 36,
            color: '2E75B6',
          })],
          alignment: AlignmentType.CENTER,
          spacing: {after: 200},
        }));

        // Separator
        children.push(new Paragraph({
          children: [new TextRun({
            text: '───────────────────────────────────────',
            size: 20,
            color: 'AAAAAA',
          })],
          alignment: AlignmentType.CENTER,
          spacing: {after: 300},
        }));

        // Coordinates section
        if (this.coordinatesStr) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: 'Координаты', bold: true, size: 28, color: '1F4E79' }),
            ],
            spacing: {after: 100},
          }));
          children.push(new Paragraph({
            children: [new TextRun({ text: this.coordinatesStr, size: 24 })],
            spacing: {after: 300},
          }));
        }

        // Properties table
        if (this.details && this.details.length > 0) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: 'Атрибуты', bold: true, size: 28, color: '1F4E79' }),
            ],
            spacing: {after: 100},
          }));

          const tableRows = [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Свойство', bold: true, size: 22 })] })], width: { size: 3000, type: WidthType.DXA } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Значение', bold: true, size: 22 })] })], width: { size: 8000, type: WidthType.DXA } }),
              ],
            }),
          ];

          this.details.forEach(detail => {
            if (!!detail.value) {
              tableRows.push(new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: detail.titleName, size: 22 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(detail.value), size: 22 })] })] }),
                ],
              }));
            }
          });

          children.push(new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }));

          children.push(new Paragraph({ spacing: {after: 300} }));
        }

        // Images
        if (this.imgs && this.imgs.length > 0) {
          for (const category of this.imgs) {
            children.push(new Paragraph({
              children: [
                new TextRun({
                  text: category.categoryTitle || category.category,
                  bold: true,
                  size: 28,
                  color: '1F4E79',
                }),
              ],
              spacing: {after: 100},
            }));

            // Limit images per category to avoid too large doc
            const maxImages = 20;
            const imgsToProcess = category.imgs.slice(0, maxImages);

            for (const img of imgsToProcess) {
              try {
                const imgData = await this.fetchImageAsBase64(img.large);
                if (imgData) {
                  const ext = img.large.match(/\.(png|jpe?g|gif|webp)/i)?.[1] || 'jpeg';
                  const imageType = ext === 'jpg' ? 'jpeg' : ext;

                  children.push(new Paragraph({
                    children: [
                      new ImageRun({
                        data: imgData.base64,
                        transformation: {
                          width: 400,
                          height: 533,
                        },
                        type: imageType,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: {after: 50},
                  }));

                  if (img.label) {
                    children.push(new Paragraph({
                      children: [new TextRun({ text: img.label, size: 20, color: '666666', italics: true })],
                      alignment: AlignmentType.CENTER,
                      spacing: {after: 200},
                    }));
                  }
                }
              } catch (e) {
                console.warn('Failed to embed image:', img.large, e);
              }
            }

            if (category.imgs.length > maxImages) {
              children.push(new Paragraph({
                children: [new TextRun({ text: `... и ещё ${category.imgs.length - maxImages} изображений`, size: 20, color: '999999' })],
                spacing: {after: 200},
              }));
            }
          }
        }

        // Footer
        children.push(new Paragraph({
          children: [new TextRun({
            text: `Сформировано ${new Date().toLocaleDateString('ru-RU')}`,
            size: 18,
            color: 'AAAAAA',
            italics: true,
          })],
          alignment: AlignmentType.CENTER,
          spacing: {before: 400},
        }));

        const doc = new Document({
          sections: [{
            properties: {
              page: {
                margin: {
                  top: 1000,
                  right: 1000,
                  bottom: 1000,
                  left: 1000,
                },
              },
            },
            children,
          }],
        });

        const blob = await Packer.toBlob(doc);
        const idStr = idDetail?.value || this.$route.params.id || 'unknown';
        saveAs(blob, `passport_${idStr}.docx`);
      } catch (e) {
        console.error('Word export error:', e);
        this.$message?.error?.('Ошибка при создании Word-документа');
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
