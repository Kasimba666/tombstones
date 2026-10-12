<template>
  <div class="PgPublications">
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
        <span class="count-label">Показано публикаций:</span>
        <span class="count-value">{{ filteredPublications.length }}</span>
        <span class="count-total" v-if="filteredPublications.length !== publications.length">из {{ publications.length }}</span>
      </div>
    </div>

    <!-- Фильтры в стиле "Списка камней" -->
    <div class="pubs-filters">
      <div class="filter-block">
        <div class="label-placeholder">
          <label>Тип:</label>
        </div>
        <div class="filter-placeholder">
          <el-select v-model="selectedTypes"
                     multiple
                     collapse-tags
                     collapse-tags-tooltip
                     clearable
                     placeholder="(все)"
                     size="small"
                     style="width: 160px"
                     :max-collapse-tags="1"
          >
            <el-option
                v-for="type of availableTypes"
                :key="type"
                :label="type"
                :value="type"
            />
          </el-select>
        </div>
      </div>
      <div class="filter-block">
        <div class="label-placeholder">
          <label>Авторы:</label>
        </div>
        <div class="filter-placeholder">
          <el-select v-model="selectedAuthors"
                     multiple
                     clearable
                     placeholder="(все)"
                     size="small"
                     style="width: 220px"
          >
            <el-option
                v-for="author of availableAuthors"
                :key="author"
                :label="author"
                :value="author"
            />
          </el-select>
        </div>
      </div>
    </div>

    <!-- Режим "Мозаика" -->
    <div class="pubs-mosaic" v-if="publicationsViewMode === 'mosaic'">
      <template v-if="filteredPublications.length > 0">
        <div class="pub-card"
             v-for="(pub, i) of filteredPublications" :key="i"
             @click="openPublication(pub)"
        >
          <div class="pub-card-cover">
            <img class="pub-card-cover-img"
                 :src="previews[pub.filename]"
                 :alt="pub.title"
                 v-if="!!previews[pub.filename]"
            />
            <el-icon class="pub-card-cover-icon" v-else><Document /></el-icon>
            <span class="pub-type">{{ pub.type }}</span>
            <el-button class="pub-card-download"
                       type="primary" size="small" circle
                       tag="a"
                       :href="publicationLink(pub)"
                       :download="pub.filename"
                       title="Скачать"
                       @click.stop
            >
              <el-icon><Download /></el-icon>
            </el-button>
          </div>
          <div class="pub-card-body">
            <div class="pub-card-title">{{ pub.title }}</div>
            <div class="pub-card-authors">{{ pub.authors }}</div>
            <div class="pub-card-year">{{ pub.year }}</div>
          </div>
        </div>
      </template>
      <div class="pubs-empty" v-else>Нет публикаций по выбранным фильтрам</div>
    </div>

    <!-- Режим "Список" -->
    <div class="pubs-list" v-if="publicationsViewMode === 'list'">
      <template v-if="filteredPublications.length > 0">
        <div class="pub-row"
             v-for="(pub, i) of filteredPublications" :key="i"
             @click="openPublication(pub)"
        >
          <div class="pub-row-cover">
            <img class="pub-row-cover-img"
                 :src="previews[pub.filename]"
                 :alt="pub.title"
                 v-if="!!previews[pub.filename]"
            />
            <el-icon class="pub-row-cover-icon" v-else><Document /></el-icon>
          </div>
          <div class="pub-row-body">
            <div class="pub-row-title">{{ pub.title }}</div>
            <div class="pub-row-authors">{{ pub.authors }}</div>
          </div>
          <span class="pub-type">{{ pub.type }}</span>
          <div class="pub-row-year">{{ pub.year }}</div>
          <el-button class="pub-row-download"
                     type="primary" size="small" circle
                     tag="a"
                     :href="publicationLink(pub)"
                     :download="pub.filename"
                     title="Скачать"
                     @click.stop
          >
            <el-icon><Download /></el-icon>
          </el-button>
        </div>
      </template>
      <div class="pubs-empty" v-else>Нет публикаций по выбранным фильтрам</div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import {renderPdfFirstPage} from "@/services/pdfPreview.js";

export default {
  name: 'PgPublications',
  components: {},
  props: [],
  data() {
    return {
      //режим просмотра публикаций: 'mosaic' - мозаика, 'list' - список
      publicationsViewMode: 'mosaic',
      //превью первой страницы pdf: имя файла -> data-url изображения
      previews: {},
      //отмеченные значения фильтров (пусто = показать все)
      selectedTypes: [],
      selectedAuthors: [],
    }
  },
  computed: {
    ...mapState(['publications']),
    //доступные типы: только типы публикаций, подходящих под выбранных авторов
    availableTypes() {
      let types = [];
      this.publications.forEach((pub) => {
        let authors = this.authorsList(pub);
        let authorsPass = this.selectedAuthors.length === 0 || this.selectedAuthors.some((author) => authors.includes(author));
        if (authorsPass && pub.type && !types.includes(pub.type)) types.push(pub.type);
      });
      return types;
    },
    //доступные авторы: только авторы публикаций, подходящих под выбранный тип (по алфавиту)
    availableAuthors() {
      let authors = [];
      this.publications.forEach((pub) => {
        let typePass = this.selectedTypes.length === 0 || this.selectedTypes.includes(pub.type);
        if (!typePass) return;
        this.authorsList(pub).forEach((author) => {
          if (!authors.includes(author)) authors.push(author);
        });
      });
      return authors.sort((a, b) => a > b ? 1 : -1);
    },
    //публикации с учётом фильтров по типу и авторам (пустой фильтр = без ограничений)
    filteredPublications() {
      return this.publications.filter((pub) => {
        let typePass = this.selectedTypes.length === 0 || this.selectedTypes.includes(pub.type);
        let authors = this.authorsList(pub);
        let authorsPass = this.selectedAuthors.length === 0 || this.selectedAuthors.some((author) => authors.includes(author));
        return typePass && authorsPass;
      });
    },
  },
  methods: {
    //массив авторов публикации: ячейка authors разбирается по запятым
    authorsList(pub) {
      if (!pub.authors) return [];
      return pub.authors.split(',').map((v) => v.trim()).filter((v) => v !== '');
    },
    //ссылка на pdf-файл публикации из public/assets/publications
    publicationLink(pub) {
      if (!pub.filename) return '';
      return '/assets/publications/' + encodeURIComponent(pub.filename);
    },
    openPublication(pub) {
      let link = this.publicationLink(pub);
      if (link !== '') window.open(link, '_blank');
    },
    //рендер превью первой страницы для всех публикаций (результат кэшируется в сервисе)
    loadPreviews() {
      this.publications.forEach((pub) => {
        if (!pub.filename || this.previews[pub.filename] !== undefined) return;
        //заглушка, чтобы не запускать рендер повторно
        this.previews[pub.filename] = null;
        renderPdfFirstPage(this.publicationLink(pub))
          .then((dataUrl) => {
            this.previews[pub.filename] = dataUrl;
          })
          .catch(() => {
            //без превью останется иконка-заглушка
          });
      });
    },
  },
  watch: {
    publications: {
      immediate: true,
      handler() {
        this.loadPreviews();
      },
    },
    //убрать из выбранных типов те, которых больше нет в списке доступных (как в ObjsFilters)
    availableTypes() {
      let newVal = this.selectedTypes.filter((type) => this.availableTypes.includes(type));
      if (newVal.length !== this.selectedTypes.length) this.selectedTypes = newVal;
    },
    //убрать из выбранных авторов тех, которых больше нет в списке доступных
    availableAuthors() {
      let newVal = this.selectedAuthors.filter((author) => this.availableAuthors.includes(author));
      if (newVal.length !== this.selectedAuthors.length) this.selectedAuthors = newVal;
    },
  },
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

      .count-total {
        font-weight: normal;
        color: hsl(0, 0%, 40%);
      }
    }
  }

  //фильтры в стиле ObjsFilters ("Список камней"), расположены по горизонтали с переносом;
  //компактно: блоки по ширине контента, минимальные отступы между фильтрами
  //и между именем фильтра и списком его значений
  .pubs-filters {
    width: 100%;
    height: auto;
    padding: 3px 10px;
    display: flex;
    flex-flow: row wrap;
    justify-content: start;
    align-items: center;
    gap: 5px;

    .filter-block {
      display: flex;
      flex-flow: row nowrap;
      justify-content: left;
      align-items: center;
      gap: 3px;

      .label-placeholder {
        width: auto;
        height: auto;
        text-align: left;
        display: flex;
        align-items: center;
        white-space: nowrap;
      }

      .filter-placeholder {
        width: auto;
        height: auto;
      }
    }
  }

  //тип публикации — атрибут: мягкая плашка-метка без рамки и тени, чтобы не выглядела кнопкой
  .pub-type {
    display: inline-flex;
    align-items: center;
    padding: 0 4px;
    border-radius: 3px;
    background-color: hsl(180, 100%, 25%, 0.1);
    font-size: 10px;
    font-weight: bold;
    color: hsl(180, 100%, 25%);
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
        height: 130px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        background-color: hsl(0, 0%, 92%);

        .pub-card-cover-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 5px;
        }

        .pub-card-cover-icon {
          font-size: 40px;
          color: hsl(0, 0%, 60%);
        }

        //поверх обложки — более непрозрачная подложка, чтобы метка читалась поверх картинки
        .pub-type {
          position: absolute;
          top: 3px;
          left: 3px;
          background-color: hsl(0, 0%, 100%, 0.85);
        }

        //иконка скачивания в правом верхнем углу обложки — заметная заливка primary + тень
        .pub-card-download {
          position: absolute;
          top: 3px;
          right: 3px;
          z-index: 1;
          box-shadow: 0 1px 3px hsl(0, 0%, 0%, 0.3);
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
        height: 48px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        background-color: hsl(0, 0%, 92%);
        overflow: hidden;

        .pub-row-cover-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

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

      .pub-row-download {
        flex: 0 0 auto;
      }
    }
  }
}
</style>

