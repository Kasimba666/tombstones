<template>
  <div>
    <div
        v-for="(detail, d) of details" :key="d">
      <b v-if="!!detail.title_name">{{ detail.title_name }}: </b> {{detail.value}}
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    details: Array
  },
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

</style>
