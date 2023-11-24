<template>
  <div class="details">
    <div>
      <div class="collection-images" v-if="!!imgsCard">
        <div v-for="(v, i) of imgsCard.imgs" :key="i">
          <a :href="v.large" target="_blank">
            <div class="dogs-card-image-background"
                 :style="{backgroundImage: `url(${v.small})`}">
            </div>
          </a>
        </div>
      </div>
      <div class="sketchfab"
           v-if="!!details && sketchfab != null">
        <div class="sketchfab-embed-wrapper">
          <iframe allowfullscreen mozallowfullscreen="true"
                  webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking
                  execution-while-out-of-viewport execution-while-not-rendered web-share
                  :src="sketchfab">
          </iframe>
        </div>

      </div>
    </div>
    <div
        v-for="(detail, i) of details" :key="i">
      <div v-if="!!detail.value && detail.titleName != '3d'">
        <b> {{ detail.titleName }}: </b> {{ detail.value }}
      </div>
    </div>
    <button class="btn-close"
            @click="$emit('clickCloseDetails')"
    >
    </button>

    <div>
      <div v-if="!!imgsOther">
        <div class="collection-images" v-for="w of imgsOther">
          <!--          <div>{{w['categoryTitle']}}</div>-->
          <div v-for="(v,i) of w.imgs" :key="i">
            <div v-if="v != null">
              <a :href="v.large" target="_blank">
                <div class="dogs-card-image-background" :style="{backgroundImage: `url(${v.small})`}"></div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const imgsPath = '@/assets/img/';//Этот путь указан в коде, надо исправить!
const smallImgPath = '300px/';
const largeImgPath = 'large/';
export default {
  components: {},
  props: {
    details: Array,
    imgs: Array,
  },
  emits: ['clickCloseDetails'],
  data() {
    return {}
  },
  computed: {
    imgsCard() {
      if (!!this.imgsByCategories && this.imgsByCategories.length > 0) {
        return this.imgsByCategories.filter((v) => {
          if (v['category'] === 'cards') {
            return v
          }
        })[0];
      }
    },
    imgsOther() {
      if (!!this.imgsByCategories && this.imgsByCategories.length > 0) {
        return this.imgsByCategories.filter((v) => {
          if (v['category'] != 'cards') {
            return v
          }
        });
      }
    },
    imgsByCategories() {
      if (!!this.imgs && this.imgs.length > 0) {
        return [...new Set(this.imgs.map(v => {
          return v['category']
        }))]
            .map((v) => {
              return {
                category: v, categoryTitle: this.imgs.filter((w) => {
                  if (w['category'] === v) {
                    return w
                  }
                })[0]['category_title'], imgs: this.imgs.filter((w) => {
                  if (w['category'] === v) {
                    return w
                  }
                }).sort((a, b) => {
                  return (a['order'] > b['order']) ? 1 : -1
                }).map((s) => {
                  return {
                    small: require('@/assets/img/' + s['path'] + '/' + smallImgPath + s['filename']),
                    large: require('@/assets/img/' + s['path'] + '/' + largeImgPath + s['filename'])
                  }
                })
              }
            })
      } else {
        return null
      }
    },
    sketchfab() {
      if (!this.details || this.details.filter(v => {
        if (v.titleName === '3d' && v.value != '' && v.value != null) return v
      }).length === 0) {
        return null
      }
      return this.details.filter(v => {
        if (v.titleName === '3d') return v
      })[0].value + '/embed';
    },
  },
  methods: {
    urlHref(v) {
      return `${v}`
      // return `url(${v})`
    },
  },
  mounted() {

  },
}
</script>

<style lang="scss">
.details {
  position: relative;
  padding: 5px;
  padding-top: 25px;
}

.btn-close {
  position: absolute;
  top: 5px;
  left: 5px;
}

.collection-images {
  position: relative;
  height: 50%;
  display: flex;
  flex-flow: row;
  justify-content: space-around;
  //justify-content: center;
  gap: 10px;

}

.my-image {
  flex: 1 1 auto;
  width: 200px;
  height: auto;
  min-width: 20px;
  min-height: 60px;
  border-style: solid;
  border-color: gray;
  border-radius: 20px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  align-items: center;

  &:hover {
    box-shadow: 0 0 10px 3px rgba(0, 140, 186, 0.5);
  }
}

.dogs-card-image-background {
  flex: 0 0 auto;
  width: 140px;
  height: 140px;
  //width: auto;
  //height: 100%;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
