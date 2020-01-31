import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '../store'

// Views
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Gear from '../views/Gear.vue'

Vue.use(VueRouter)

const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      public: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
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
    path: '/gear',
    name: 'Gear',
    component: Gear
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public)
  const onlyWhenLoggedOut = to.matched.some(record => record.meta.onlyWhenLoggedOut)
  const loggedIn = store.state.loggedIn

  console.log('logged in', loggedIn)

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
