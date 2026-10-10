<template>
  <div class="PgPublications">
    <div class="my-title-text">публикации</div>
    <div class="pubs-toolbar">
      <el-radio-group v-model="publicationsViewMode"
                      size="small"
                      class="data-view-switch"
      >
        <el-radio-button value="mosaic">
          <el-icon><Grid /></el-icon>
          <span>Мозаика</span>
        </el-radio-button>
        <el-radio-button value="list">
          <el-icon><List /></el-icon>
          <span>Список</span>
        </el-radio-button>
      </el-radio-group>
      <div class="count-block">
        <span class="count-label">Всего публикаций:</span>
        <span class="count-value">{{ publications.length }}</span>
      </div>
    </div>

    <!-- Режим "Мозаика" -->
    <div class="pubs-mosaic" v-if="publicationsViewMode === 'mosaic'">
      <template v-if="publications.length > 0">
        <div class="pub-card"
             v-for="(pub, i) of publications" :key="i"
             @click="openPublication(pub)"
        >
          <div class="pub-card-cover">
            <el-icon class="pub-card-cover-icon"><Document /></el-icon>
            <span class="pub-type">{{ pub.type }}</span>
          </div>
          <div class="pub-card-body">
            <div class="pub-card-title">{{ pub.title }}</div>
            <div class="pub-card-authors">{{ pub.authors }}</div>
            <div class="pub-card-year">{{ pub.year }}</div>
          </div>
          <el-button size="small" type="primary" plain
                     @click.stop="openPublication(pub)"
          >
            <el-icon><TopRight /></el-icon>
            <span>Открыть PDF</span>
          </el-button>
        </div>
      </template>
      <div class="pubs-empty" v-else>Нет данных</div>
    </div>

    <!-- Режим "Список" -->
    <div class="pubs-list" v-if="publicationsViewMode === 'list'">
      <template v-if="publications.length > 0">
        <div class="pub-row"
             v-for="(pub, i) of publications" :key="i"
             @click="openPublication(pub)"
        >
          <div class="pub-row-cover">
            <el-icon class="pub-row-cover-icon"><Document /></el-icon>
          </div>
          <div class="pub-row-body">
            <div class="pub-row-title">{{ pub.title }}</div>
            <div class="pub-row-authors">{{ pub.authors }}</div>
          </div>
          <span class="pub-type">{{ pub.type }}</span>
          <div class="pub-row-year">{{ pub.year }}</div>
          <el-button size="small" type="primary" plain
                     @click.stop="openPublication(pub)"
          >
            <el-icon><TopRight /></el-icon>
            <span>Открыть PDF</span>
          </el-button>
        </div>
      </template>
      <div class="pubs-empty" v-else>Нет данных</div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: 'PgPublications',
  components: {},
  props: [],
  data() {
    return {
      //режим просмотра публикаций: 'mosaic' - мозаика, 'list' - список
      publicationsViewMode: 'mosaic',
    }
  },
  computed: {
    ...mapState(['publications']),
  },
  methods: {
    //ссылка на pdf-файл публикации из public/assets/publications
    publicationLink(pub) {
      if (!pub.filename) return '';
      return '/assets/publications/' + encodeURIComponent(pub.filename);
    },
    openPublication(pub) {
      let link = this.publicationLink(pub);
      if (link !== '') window.open(link, '_blank');
    },
  },
  watch: {},
  mounted() {
  },
}
</script>
<style lang="scss">
.PgPublications {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 80dvh;
  display: flex;
  flex-flow: column nowrap;
  justify-content: start;
  align-items: center;
  font-size: 18px;
  padding-bottom: 10px;

  .my-title-text {
    width: 100%;
    height: auto;
    text-align: center;
    margin-bottom: 5px;
    font-size: 18px;
    font-weight: bold;
    color: hsl(0, 0%, 40%);
    padding-top: 10px;
  }

  .pubs-toolbar {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    padding: 0 10px;
    margin-bottom: 5px;

    .count-block {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      font-weight: bold;
      color: hsl(180, 100%, 25%);
    }
  }

  .pub-type {
    display: inline-flex;
    align-items: center;
    padding: 1px 5px;
    border-radius: 5px;
    border: 2px solid hsl(60, 0%, 60%);
    font-size: 11px;
    font-weight: bold;
    color: hsl(60, 0%, 40%);
    white-space: nowrap;
  }

  .pubs-empty {
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: hsl(0, 0%, 40%);
    padding: 10px;
  }

  /* ===== Мозаика ===== */
  .pubs-mosaic {
    width: 100%;
    padding: 0 10px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 5px;

    .pub-card {
      display: flex;
      flex-flow: column nowrap;
      justify-content: space-between;
      gap: 5px;
      padding: 5px;
      border-radius: 5px;
      border: 1px solid hsl(60, 0%, 75%);
      background-color: hsl(0, 0%, 100%, 0.7);
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        box-shadow: 0 0 10px 3px hsl(206, 11%, 80%, 0.7);
      }

      .pub-card-cover {
        position: relative;
        width: 100%;
        height: 90px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        background-color: hsl(0, 0%, 92%);

        .pub-card-cover-icon {
          font-size: 40px;
          color: hsl(0, 0%, 60%);
        }

        .pub-type {
          position: absolute;
          top: 3px;
          left: 3px;
        }
      }

      .pub-card-body {
        display: flex;
        flex-flow: column nowrap;
        gap: 3px;

        .pub-card-title {
          font-size: 14px;
          font-weight: bold;
          color: hsl(0, 0%, 25%);
        }

        .pub-card-authors {
          font-size: 12px;
          color: hsl(0, 0%, 40%);
        }

        .pub-card-year {
          font-size: 12px;
          font-weight: bold;
          color: hsl(180, 100%, 25%);
        }
      }
    }
  }

  /* ===== Список ===== */
  .pubs-list {
    width: 100%;
    padding: 0 10px;
    display: flex;
    flex-flow: column nowrap;
    gap: 3px;

    .pub-row {
      display: flex;
      flex-flow: row nowrap;
      justify-content: start;
      align-items: center;
      gap: 5px;
      padding: 3px 5px;
      border-radius: 5px;
      border: 1px solid hsl(60, 0%, 80%);
      background-color: hsl(0, 0%, 100%, 0.7);
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        box-shadow: 0 0 10px 3px hsl(206, 11%, 80%, 0.7);
      }

      .pub-row-cover {
        flex: 0 0 auto;
        width: 36px;
        height: 44px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        background-color: hsl(0, 0%, 92%);

        .pub-row-cover-icon {
          font-size: 20px;
          color: hsl(0, 0%, 60%);
        }
      }

      .pub-row-body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-flow: column nowrap;
        gap: 2px;

        .pub-row-title {
          font-size: 14px;
          font-weight: bold;
          color: hsl(0, 0%, 25%);
        }

        .pub-row-authors {
          font-size: 12px;
          color: hsl(0, 0%, 40%);
        }
      }

      .pub-row-year {
        flex: 0 0 auto;
        font-size: 13px;
        font-weight: bold;
        color: hsl(180, 100%, 25%);
      }
    }
  }
}
</style>

