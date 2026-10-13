<template>
  <div class="PgNotFound">
    <div class="nf-code">404</div>
    <div class="nf-title">страница не найдена</div>
    <div class="nf-path">{{ $route.path }}</div>
    <div class="nf-actions">
      <el-button size="small"
                 type="primary"
                 @click="$router.push({name: 'ObjsFiltersAndList'})"
      >На главную
      </el-button>
      <el-button size="small"
                 @click="$router.push({name: 'PgPublications'})"
      >Публикации
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PgNotFound',
  props: [],
  data() {
    return {}
  },
  computed: {},
  methods: {},
  watch: {},
}
</script>

<style lang="scss" scoped>
.PgNotFound {
  position: relative;
  width: 100%;
  min-height: 80dvh;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
  text-align: center;

  .nf-code {
    font-size: 40px;
    font-weight: bold;
    color: hsl(180, 100%, 25%);
    line-height: 1;
  }

  .nf-title {
    font-size: 16px;
    font-weight: bold;
    color: hsl(0, 0%, 40%);
  }

  .nf-path {
    font-size: 12px;
    color: hsl(0, 0%, 55%);
    word-break: break-all;
  }

  .nf-actions {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }
}
</style>
