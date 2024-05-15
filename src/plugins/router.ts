import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

import Home from '@/pages/Home.vue'
import Settings from '@/pages/Settings.vue'
import SettingsGeneral from '@/pages/settings/General.vue'
import STT from '@/pages/settings/STT.vue'
import TTS from '@/pages/settings/TTS.vue'
import Appearance from '@/pages/settings/Appearance.vue'
import WordReplace from '@/pages/settings/WordReplace.vue'
import Translation from '@/pages/settings/Translation.vue'
import Connections from '@/components/settings/connections/Connections.vue'
import OSC from '@/pages/settings/OSC.vue'
import OSCParams from '@/pages/settings/OSCParams.vue'

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
        path: 'appearance',
        name: 'appearance',
        components: {
          default: Settings,
          panel: Appearance,
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
