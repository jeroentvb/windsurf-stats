import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '../store'

// Views
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import AddSession from '../views/AddSession.vue'

Vue.use(VueRouter)

export const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      public: true
    }
  },
  {
    path: '/',
    name: 'Statistics',
    component: Home
  },
  {
    path: '/all-statistics',
    name: 'All statistics',
    component: () => import(/* webpackChunkName: "all-statistics" */ '../views/AllStatistics.vue')
  },
  {
    path: '/add-session',
    name: 'Add Session',
    component: AddSession
  },
  {
    path: '/gear',
    name: 'Gear',
    component: () => import(/* webpackChunkName: "gear" */ '../views/Gear.vue')
  },
  {
    path: '/spot',
    name: 'Spots',
    component: () => import(/* webpackChunkName: "gear" */ '../views/Spot.vue')
  },
  {
    path: '/preferences',
    name: 'Preferences',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "preferences" */ '../views/Preferences.vue')
  }
]

if (process.env.VUE_APP_ALLOW_REGISTER === 'true') {
  routes.push({
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "register" */ '../views/Register.vue'),
    meta: {
      public: true
    }
  })
}

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public)
  const onlyWhenLoggedOut = to.matched.some(record => record.meta.onlyWhenLoggedOut)
  const loggedIn = store.state.loggedIn

  if (!isPublic && !loggedIn) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath } // Store the full path to redirect the user to after login
    })
  }

  // Do not allow user to visit login page or register page if they are logged in
  if (loggedIn && onlyWhenLoggedOut) {
    return next('/')
  }

  next()
})

export default router
