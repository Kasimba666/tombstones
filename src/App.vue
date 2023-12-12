<template>
  <div class="screen-monitor" v-if="DEBUG">
    {{ screen.type }}<br/>
    {{ screen.width }}px
  </div>
    <ObjsNavbar></ObjsNavbar>
    <div class="app">
      <router-view/>
    </div>
</template>

<script>
import ObjsNavbar from "@/components/ObjsNavBar";
import {mapGetters, mapMutations} from "vuex";
export default {
  components: {ObjsNavbar},
  data() {
    return {
      DEBUG: process.env.NODE_ENV === 'development',
    }
  },
  computed: {
    ...mapGetters({screen: "getScreen", screenBreakpoints: "getScreenBreakpoints"}),
  },
  methods: {
    ...mapMutations({setScreen: "setScreen"}),
    onResize() {
      let screen = {};
      let t = "";
      switch (true) {
        case this.screen.width <= this.screenBreakpoints.sm:
          t = "xs";
          break;
        case this.screen.width <= this.screenBreakpoints.md:
          t = "sm";
          break;
        case this.screen.width <= this.screenBreakpoints.lg:
          t = "md";
          break;
        case this.screen.width <= this.screenBreakpoints.xl:
          t = "lg";
        case this.screen.width <= this.screenBreakpoints.xxl:
          t = "xl";
          break;
        default:
          t = "xxl";
          break;
      }
      screen['width'] =  window.innerWidth;
      screen['height'] = window.innerHeight;
      screen['type'] = t;
      this.setScreen(screen);
    }
  },
  mounted() {
    this.onResize();
    window.addEventListener("resize", this.onResize);
  },
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-size: 0.9rem;
}

.app {
  padding: 20px;
}
.screen-monitor {
  position: absolute;
  left: 10px;
  top: 10px;
  font-size: 12px;
  color: black;
  z-index: 10;
}
</style>
