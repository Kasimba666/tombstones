<template>
  <div class="container-fluid">

    <div class="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
      <div class="objs-filter-and-list">
        <objs-filters
            :filters="filtersSettlements"
        >
        </objs-filters>
        <obj-details
            :details="detailsSettlement"
        >
        </obj-details>
        <objs-list
            :rows="rowsSettlements"
            :titles="colsSettlements"
            @clickRow="setCurrentObjFromRow"
        >
        </objs-list>
    </div>
  </div>

  </div>
</template>

<script>
import {mapState, mapActions, mapGetters, mapMutations} from 'vuex';
import ObjsList from "@/components/ObjsList";
import ObjDetails from "@/components/ObjDetails";
import ObjsFilters from "@/components/ObjsFilters";


export default {
  components: {ObjsList, ObjDetails, ObjsFilters},
  props: [],
  data() {
    return {}
  },
  computed: {
    ...mapState({
    }),
    ...mapGetters({
      colsSettlements: 'settle/cols',
      rowsSettlements: 'settle/rows',
      detailsSettlement: 'settle/details',
      filtersSettlements: 'settle/filters',
    })
  },
  methods: {
    ...mapMutations({
      setTitleTableOn: 'settle/setTitleTableOn',
      setTitleTableOff: 'settle/setTitleTableOff',
      setCurrentObjFromRow: 'settle/setCurrentObjFromRow',
    }),
    ...mapActions({
      loadSettlements: 'settle/loadSettlements',


    }),
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
.objs-filter-and-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  background-color: hsl(0, 0%, 90%);
}

.objs-filter {
  background-color: hsl(0, 0%, 70%);
  padding: 5px;
}

.objs-list {
  background-color: hsl(0, 0%, 70%);
  padding: 5px;
}
</style>
