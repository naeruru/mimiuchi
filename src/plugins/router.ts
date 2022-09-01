import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Header from '../components/Header.vue'


const routes = [
  {
    path: '/',
    name: 'home',
    components: {
      default: Home,
      Header
    }
  }
]

export default createRouter({
  history: createWebHistory(process.env.NODE_ENV === 'production' ? './' : './'),
  routes,
})