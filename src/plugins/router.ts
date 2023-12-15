import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Home from '@/pages/Home.vue'

import Settings from '@/pages/Settings.vue'
import SettingsGeneral from '@/components/settings/General.vue'
import STT from '@/components/settings/STT.vue'
import TTS from '@/components/settings/TTS.vue'
import Appearance from '@/components/settings/Appearance.vue'
import WordReplace from '@/components/settings/WordReplace.vue'
import Translation from '@/components/settings/Translation.vue'
import Connections from '@/components/settings/connections/Connections.vue'
import OSC from '@/components/settings/OSC.vue'
import OSCParams from '@/components/settings/OSCParams.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    components: {
      default: Home,
      // Header,
      Footer,
    },
  },
  {
    path: '/settings/',
    name: 'settings',
    components: {
      default: Settings,
      panel: SettingsGeneral,
      Header,
      Footer,
    },
    children: [
      {
        path: 'general',
        name: 'general',
        components: {
          default: Settings,
          panel: SettingsGeneral,
          Header,
        },
      },
      {
        path: 'stt',
        name: 'stt',
        components: {
          default: Settings,
          panel: STT,
          Header,
        },
      },
      {
        path: 'tts',
        name: 'tts',
        components: {
          default: Settings,
          panel: TTS,
          Header,
        },
      },
      {
        path: 'appearance',
        name: 'appearance',
        components: {
          default: Settings,
          panel: Appearance,
          Header,
        },
      },
      {
        path: 'wordreplace',
        name: 'wordreplace',
        components: {
          default: Settings,
          panel: WordReplace,
          Header,
        },
      },
      {
        path: 'translation',
        name: 'translation',
        components: {
          default: Settings,
          panel: Translation,
          Header,
        },
      },
      {
        path: 'connections',
        name: 'connections',
        components: {
          default: Settings,
          panel: Connections,
          Header,
        },
      },
      {
        path: 'osc',
        name: 'osc',
        components: {
          default: Settings,
          panel: OSC,
          Header,
        },
      },
      {
        path: 'oscparams',
        name: 'oscparams',
        components: {
          default: Settings,
          panel: OSCParams,
          Header,
        },
      },
    ],
  },
]

export default createRouter({
  history: createWebHistory('/'),
  routes: routes as RouteRecordRaw[],
})
