import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'

import App from './App.vue'

import firebaseApp from './firebase'
import router from './router'
import store from './store'

import 'bootstrap/dist/css/bootstrap.min.css'
import('bootstrap')

import './assets/style/base.css'

const app = createApp(App)
.use(VueFire, {
    firebaseApp,
    modules: [ VueFireAuth() ]
})
.use(router)
.use(store)

app.mount('#app')
