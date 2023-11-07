<template>
  <div class="details">
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
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    details: Array
  },
  emits: ['clickCloseDetails'],
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
</style>
