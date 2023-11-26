<template>
  <div class="screen-monitor" v-if="DEBUG">
    {{ screen.type }}<br/>
    {{ screen.width }}px
  </div>
    <Navbar></Navbar>
    <div class="app">
      <router-view/>
    </div>
</template>

<script>
import Navbar from "@/components/NavBar";
import {mapGetters, mapMutations} from "vuex";
export default {
  components: {Navbar},
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
        case screen.width <= this.screenBreakpoints.sm:
          t = "xs";
          break;
        case screen.width <= this.screenBreakpoints.md:
          t = "sm";
          break;
        case screen.width <= this.screenBreakpoints.lg:
          t = "md";
          break;
        case screen.width <= this.screenBreakpoints.xl:
          t = "lg";
        case screen.width <= this.screenBreakpoints.xxl:
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
}
</style>
