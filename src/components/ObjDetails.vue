<template>
  <div class="details">
    <div>
      <div class="collection-images" v-if="!!imgsCard">
        <div v-for="(v, i) of imgsCard.imgs" :key="i">
          <img class="my-image" :src="v"/>
        </div>
      </div>
    </div>
    <div
        v-for="(detail, d) of details" :key="d">
      <div v-if="!!detail.value">
        <b> {{ detail.titleName }}: </b> {{ detail.value }}
      </div>
    </div>
    <button class="btn-close"
            @click="$emit('clickCloseDetails')"
    >
    </button>
<!--    {{ !!imgsByCategories && imgsByCategories.length > 0 ? imgsByCategories : '' }}-->
    <div>
      <div v-if="!!imgsOther">
        <div class="collection-images" v-for="w of imgsOther">
<!--          <div>{{w['categoryTitle']}}</div>-->
          <div v-for="(v,i) of w.imgs" :key="i">
          <img class="my-image" :src="v" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const imgsPath = '@/assets/img';
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
                  return require('@/assets/img/' + s['path'] + '/' + smallImgPath + s['filename'])
                })
              }
            })


      }
    },
  },
  methods: {},
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
</style>
