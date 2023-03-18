import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import Header from '../components/Header.vue'
import Home from '../pages/Home.vue'

import Settings from '../pages/Settings.vue'
import SettingsGeneral from '../components/settings/General.vue'
import STT from '../components/settings/STT.vue'
import Appearance from '../components/settings/Appearance.vue'
import WordReplace from '../components/settings/WordReplace.vue'
import OSC from '../components/settings/OSC.vue'
import OSCParams from '../components/settings/OSCParams.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    components: {
      default: Home,
      // Header
    }
  },
  {
    path: '/settings/',
    name: 'settings',
    components: {
      default: Settings,
      panel: SettingsGeneral,
      Header
    },
    children: [
      {
        path: 'general',
        name: 'general',
        components: {
          default: Settings,
          panel: SettingsGeneral,
          Header
        },
      },
      {
        path: 'stt',
        name: 'stt',
        components: {
          default: Settings,
          panel: STT,
          Header
        },
      },
      {
        path: 'appearance',
        name: 'appearance',
        components: {
          default: Settings,
          panel: Appearance,
          Header
        },
      },
      {
        path: 'wordreplace',
        name: 'wordreplace',
        components: {
          default: Settings,
          panel: WordReplace,
          Header
        },
      },
      {
        path: 'osc',
        name: 'osc',
        components: {
          default: Settings,
          panel: OSC,
          Header
        },
      },
      {
        path: 'oscparams',
        name: 'oscparams',
        components: {
          default: Settings,
          panel: OSCParams,
          Header
        },
      }
    ]
  }
]


export default createRouter({
  history: createWebHashHistory(),
  // history: (import.meta.env.IS_ELECTRON) ?  createWebHashHistory() : createWebHistory(import.meta.env.NODE_ENV === 'production' ? './' : './'),
  routes,
})