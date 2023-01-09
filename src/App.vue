<script setup>
import { defineAsyncComponent } from 'vue'
import { useStore } from 'vuex'

const MainNavbar = defineAsyncComponent(() => import('./components/MainNavbar.vue'))
const MainPopup = defineAsyncComponent(() => import('./components/MainPopup.vue'))

const store = useStore()
</script>

<template>
  <div class="page-container bg-color-dark" :class="store.state.main_panel.open?'noscroll':''">
    <main-navbar />

    <div class="content-container bg-color-dark">
      <main-popup />
      
      <router-view />
    </div>

  </div>
</template>

<style scoped lang="scss" src="">
.page-container {
  display: flex;
  flex-direction: column;

  width: 100vw;
  height: 100vh;
}
.content-container {
  flex-grow : 1;
}
.noscroll {
  overflow: hidden;
}
</style>
