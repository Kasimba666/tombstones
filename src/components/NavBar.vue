<template>
      <div class="nav-buttons">
      <button type="button"
              class="btn btn-outline-secondary"
              :class="{active: $route.path === '/settlements'}"
              @click="$router.push('/settlements');"
      >
        Болгарские городища
      </button>
      <button type="button"
              class="btn btn-outline-secondary"
              :class="{active: $route.path === '/stones'}"
              @click="$router.push('/stones')"
      >
        Намогильные камни
      </button>
      <button type="button"
              class="btn btn-outline-secondary"
              :class="{active: $route.path === '/about'}"
              @click="$router.push('/about');"
      >
        О нас
      </button>
      </div>
</template>

<script>
export default {
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

<style>
.nav-buttons {
  width: 600px;
  display: flex;
  justify-content: space-around;
  gap: 10px;
  border: 3px solid gray;
  padding: 5px;
  margin: auto;
}

</style>
