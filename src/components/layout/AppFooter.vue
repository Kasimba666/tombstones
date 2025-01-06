<template>
  <div class="AppFooter">
    <div class="label-text">Проект выполняется при финансовой поддержке Российского научного фонда</div>
  </div>
</template>

<script>
export default {
  name: 'AppFooter',
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
.AppFooter {
  position: relative;
  width: 100%;
  height: auto;
  padding: 2px;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  border: 1px solid hsla(0, 0%, 50%, 0.1);
  border-radius: 5px;
  margin: 2px;
  background-color: hsl(0, 0%, 100%, 0.5);
  //font-family: 'Century Schoolbook', serif;

  .label-text {
    width: auto;
    width: auto;

    //border: 1px solid hsla(0, 0%, 50%, 0.8);
    //border-radius: 5px;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 12px;
    font-style: oblique;
  }
}
</style>
