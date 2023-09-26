<template>
  <div>
    <h6>Городища</h6> - {{ test }}
    <div>
      {{ !!settlements && settlements.length > 0 ? settlements : 'хуй вам, а не городища' }}
    </div>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex';

export default {
  components: {},
  props: [],
  data() {
    return {}
  },
  computed: {
    ...mapState({
      settlements: state => state.settle.settlements,
      test: state => state.settle.test,
    })
  },
  methods: {
    ...mapActions({
      loadSettlements: 'settle/loadSettlements'
    })
  },
  mounted() {
      try {
      this.loadSettlements();
    } catch (e) {
      console.log(e);
    }
  },
}
</script>

<style lang="scss">

</style>
