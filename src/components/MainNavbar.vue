<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { admins_collection, analytics_distribution_event, analytics_install_pwa_event, analytics_reject_pwa_event } from '../firebase'
import { useCurrentUser, useCollection } from 'vuefire'

const admins = useCollection(admins_collection)
const route = useRoute()
const user = useCurrentUser()

const is_admin = computed(() => {
  let res = false
  admins.value.forEach(admin => { if (admin.email === user.value?.email) res = true })
  return res
})

const displayMode = ref('undefined')
const deferredPrompt = ref(null)
onMounted(() => {
  displayMode.value = (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches)?  'standalone' : 'browser'
  analytics_distribution_event(user, displayMode.value)

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault()
    deferredPrompt.value = event
  });
})

const onInstallPWA = () => {
  deferredPrompt.value.prompt()
  deferredPrompt.value.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') analytics_install_pwa_event(user) 
    else analytics_reject_pwa_event(user)
    deferredPrompt.value = null
  })
}
</script>

<template>
  <nav class="navbar navbar-expand-sm navbar-dark d-flex sticky-top">
    <div class="container-fluid">
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img src="/src/assets/media/pine-cone-vector.svg" alt="application logo" class="icon">
        <span>Tutoring</span>
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="true" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav d-flex align-items-center w-100">
          <li v-if="!is_admin" class="nav-item"> <!-- is not admin -->
            <router-link :to="{ name: 'timetable' }" class="nav-link"
              :class="route.name === 'timetable' ? 'active fw-bold' : ''">Timetable</router-link>
          </li>
          <li v-else class="nav-item"> <!-- is admin -->
            <router-link :to="{ name: 'admin' }" class="nav-link"
              :class="route.name === 'admin' ? 'active fw-bold' : ''">Admin</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'login' }" class="nav-link" :class="route.name === 'login' ? 'active fw-bold' : ''">{{
            !user ? 'login' : 'logout' }}</router-link>
          </li>
          <li v-if="displayMode === 'browser'" class="nav-item ms-sm-auto">
            <span @click="onInstallPWA" class="nav-link active fw-bold install-button">Install</span>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.navbar {
  background: rgba(33, 37, 41, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-bottom: 1px solid var(--color-background-mute);
}
.icon {
  width: 35px;
  height: 35px;
}
.hover-button {
  stroke: black;
}
.install-button {
  cursor: pointer;

  background: linear-gradient(90deg, #96f7a7 0%, #60e3a2 33.33%, #01b59c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  font-size: 1.2rem;

  & .icon { transition: all .3s; }

  &:not(:hover) { .icon { filter: brightness(100) invert(1); } }
}
</style>