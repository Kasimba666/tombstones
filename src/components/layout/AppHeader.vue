<template>
  <div class="AppHeader">
    <div class="my-title"
         @click="$router.push({name: 'ObjsFiltersAndList'})"
    >
      БУЛГАРО-ТАТАРСКАЯ ЭПИГРАФИКА XIII-XVII ВВ.
    </div>
    <div class="my-menu-block">
      <div class="my-menu-items"
           @click="$router.push({name: 'ObjsFiltersAndList'})"
      >
        Список камней
      </div>
      <div class="my-menu-items"
           @click="$router.push({name: 'PgAbout'})"
      >
        О проекте
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHeader',
  components: {},
  props: [],
  data() {
    return {}
  },
  computed: {},
  methods: {},
  mounted() {
  },
}
</script>

<style lang="scss">
.AppHeader {
  flex: 0 0 auto;
  width: 100%;
  height: auto;
  padding: 2px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: start;
  align-items: center;
  gap: 2px;
  //border: 1px solid gray;
  border-radius: 5px;
  background-color: hsl(0, 0%, 100%, 0.6);
  .my-title {
    position: relative;
    width: auto;
    height: auto;
    //background-color: hsl(206, 11%, 80%);
    //opacity: 80%;
    color: hsl(60, 0%, 40%);
    text-align: center;
    font-family: 'Century Schoolbook', serif;
    font-size: 24px;
    font-weight: bold;
    padding: 1px;
    border-radius: 5px;
    //border: 1px solid gray;
  }
  .my-menu-block {
    position: relative;
    width: auto;
    height: auto;
    //border: 1px solid gray;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    gap: 24px;


    .my-menu-items {
      width: auto;
      height: 30px;
      padding: 4px;
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      border: 2px solid hsl(60, 0%, 60%);
      font-size: 12px;
      font-weight: bold;
      color: hsl(60, 0%, 40%);
      &:hover {
        box-shadow: 0 0 10px 3px rgba(0, 140, 186, 0.5);
      }
    }
  }


}
</style>
