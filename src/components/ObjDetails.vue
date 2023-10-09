<template>
  <div>
    Детали: {{ !(details == null) ? details : 'не выбрано'}}
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
