<script setup>
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

import { useCurrentUser } from 'vuefire'
import { signInWithPopup, signOut } from 'firebase/auth'
import { authentication, provider, analytics_login_event, analytics_logout_event } from '../firebase'

import { SCHOOL_EMAIL_DOMAIN } from '../global'

const store = useStore()
const router = useRouter()
const route = useRoute()
const user = useCurrentUser()

const onSignIn = async () => {
  try {
    const result = await signInWithPopup(authentication, provider)
    const user = result.user

    if (user.email.split('@')[1] === SCHOOL_EMAIL_DOMAIN) {
      analytics_login_event(user)
      if (route.query.to) router.push(route.query.to)
      store.commit('open_popup', { message: 'logged in successfully', alert: 'success' })
    } else {
      await signOut(authentication)
      store.commit('open_popup', { message: 'wrong email domain', alert: 'warning' })
    }
  } catch (error) {
    store.commit('open_popup', { message: error, alert: 'error' })
  }
}

const onSignOut = async () => {
  try {
    analytics_logout_event(user.value)
    await signOut(authentication)
    store.commit('open_popup', { message: 'you have signed out', alert: 'info' })
  } catch (error) {
    store.commit('open_popup', { message: error, alert: 'error' })
  }
}
</script>

<template>
  <div class="login-view container">
    <div class="row justify-content-center">
      <div class="login-panel-container col-12 col-md-6">

        <div class="login-panel card bg-color-mute text-white">
          <div class="card-body">
            <h5 class="card-title mb-4">{{ !user? 'Login with your school account:':'Logout here:' }}</h5>
            <div class="login-button-container d-grid">
              <button @click="!user ? onSignIn() : onSignOut()" type="button" class="login-button alert fw-bold"
                :class="!user? 'color-info':'color-danger'">
                {{ !user ? `login:` : `${user?.email}` }}
              </button>
            </div>
          </div>
        </div>
            
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-panel-container {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.login-button {
  word-break: break-all;
}
</style>