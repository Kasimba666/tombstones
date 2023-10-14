<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
        <div class="objs-filters-list-details">
          <obj-details class="objs-filters-list filters-list details" :style="{display: visibleDetails ?'block':'none'}"
                       :details="detailsSettlement"
                       @clickCloseDetails="closeDetails"
          >
          </obj-details>
          <div class="objs-filters-list filters-list" :style="{display: visibleFiltersAndList ?'block':'none'}">
            <objs-filters
                :filters="filtersSettlements"
                @changeFiltersValues="setFiltersValues"
            >
            </objs-filters>
            <objs-list
                :rows="rowsSettlements"
                :titles="colsSettlements"
                @clickRow="clickOnRow"
            >
            </objs-list>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
        <div class="objs-map">
        </div>
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
    return {
      visibleFiltersAndList: true,
      visibleDetails: false,
    }
  },
  computed: {
    ...mapState({}),
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
      setFiltersValues: 'settle/setFiltersValues',
    }),
    ...mapActions({
      loadSettlements: 'settle/loadSettlements',
    }),
    clickOnRow(v) {
      this.setCurrentObjFromRow(v);
      this.visibleDetails = true
      this.visibleFiltersAndList = false;
    },
    closeDetails() {
      this.visibleDetails = false;
      this.visibleFiltersAndList = true;
    },
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
.objs-filters-list-details {
  border: 1px solid black;
  .filters-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    background-color: hsl(0, 0%, 90%);


    .filters {
      background-color: hsl(0, 0%, 70%);
      padding: 5px;
  }
    .list {
      background-color: hsl(0, 0%, 70%);
      padding: 5px;
    }
  }
  .details {
    width: 100%;
    height: auto;
  }
}

.objs-map {
  width: 100%;
  height: 600px;
  background-color: lightgrey;
}

</style>
