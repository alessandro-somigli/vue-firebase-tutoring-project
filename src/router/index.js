import { SCHOOL_EMAIL_DOMAIN } from '../global'

import { createRouter, createWebHistory } from 'vue-router'

import store from '../store'

import { getDocs } from "firebase/firestore";
import { admins_collection } from '../firebase' 
import { getCurrentUser } from 'vuefire'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      redirect: { name: 'timetable' }
    },
    {
      path: '/timetable',
      name: 'timetable',
      component: () => import('../views/TimetableView.vue'),
      meta: { authentication: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { admin: true }
    },
    {
      path: '/admin-login',
      name: 'admin-login',
      component: () => import('../views/AdminLoginView.vue')
    }
  ]
})

router.beforeEach(async to => {
  if (to.meta.authentication) {
    const currentUser = await getCurrentUser()
    const domain = currentUser?.email.split('@')[1]
    
    if (!currentUser) {
      store.commit('open_popup', { message: 'please log in first', alert: 'warning' })
      return { name: 'login', query: { to: to.fullPath, } } 
    } else if (domain != SCHOOL_EMAIL_DOMAIN) {
      store.commit('open_popup', { message: 'please login with your school account', alert: 'warning' })
      return { name: 'login', query: { to: to.fullPath, } } 
    }
  } else if (to.meta.admin) {
    const currentUser = await getCurrentUser()
    const admins = await getDocs(admins_collection)
    
    let authenticated = false
    admins.forEach(admin => { if (admin.data().email === currentUser?.email) authenticated = true })

    if (!authenticated) {
      store.commit('open_popup', { message: 'please login as an admin', alert: 'warning' })
      return { name: 'admin-login', query: { to: to.fullPath } }
    }
  }
})

export default router
