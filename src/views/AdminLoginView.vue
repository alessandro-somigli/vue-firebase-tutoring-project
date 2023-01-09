<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

import { signInWithEmailAndPassword } from "firebase/auth"
import { authentication } from '../firebase'
import { useCurrentUser } from 'vuefire'

const store = useStore()

const router = useRouter()
const route = useRoute()

const user = useCurrentUser()

const email = ref('')
const password = ref('')

const onSignIn = async (email, password) => {
  if (email != '' && password != '') {
    try {
      await signInWithEmailAndPassword(authentication, email, password)
      store.commit('open_popup', { message: 'logged in successfully as admin', alert: 'success' })
      if (route.query.to) router.push(route.query.to)
    } catch (error) { store.commit('open_popup', { message: error, alert: 'error' }) }
  } else store.commit('open_popup', { message: 'form is incomplete', alert: 'warning' })
}
</script>

<template>
  <div>
    <div class="tutors-container container d-flex flex-wrap justify-content-center my-5">
      <div class="card flex-grow-1 bg-dark text-light rounded-start">
        <div class="card-body">
          <form>
            <div class="mb-3">
              <label for="inputEmail" class="form-label">Email address</label>
              <input v-model="email" type="email" class="form-control" id="inputEmail">
            </div>
            <div class="mb-3">
              <label for="inputPassword" class="form-label">Password</label>
              <input v-model="password" type="password" class="form-control" id="inputPassword">
            </div>
            <button @click.prevent="onSignIn(email, password)" type="submit" class="btn btn-success">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>