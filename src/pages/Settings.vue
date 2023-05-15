<template>
        <v-navigation-drawer v-model="settingsStore.drawer" :permanent="!smAndDown">
            <v-list density="compact" nav>
                <v-list-subheader>{{ $t('settings.title') }}</v-list-subheader>
                <v-list-item
                    v-for="(setting, i) in settings_general"
                    @click="$router.push({ path: `/settings/${setting.value}` })"
                    :prepend-icon="setting.icon"
                    :title="setting.title"
                    :value="setting.value"
                    :active="(setting.value === $route.name)"
                    active-color="primary"
                ></v-list-item>
                <v-divider></v-divider>
                <v-list-subheader>OSC</v-list-subheader>
                <v-list-item
                    v-if="settings_osc"
                    v-for="(setting, i) in settings_osc"
                    @click="$router.push({ path: `/settings/${setting.value}` })"
                    :prepend-icon="setting.icon"
                    :title="setting.title"
                    :value="setting.value"
                    :active="(setting.value === $route.name)"
                    active-color="primary"
                ></v-list-item>
                <p v-else class="text-caption">OSC settings are available on the desktop app</p>
            </v-list>

            <!-- <v-list :items="settings_list" density="compact" nav></v-list> -->
            <template v-slot:append>
                <v-divider></v-divider>
                <v-col class="d-flex justify-right mt-1">
                    <v-spacer></v-spacer>
                    <v-btn size="small" variant="flat" prepend-icon="mdi-tag" @click="open_external('https://github.com/naexris/chatbox-tools/releases')">v{{ APP_VERSION }}</v-btn>
                </v-col>
                
            </template>

        </v-navigation-drawer>

        <router-view name="panel" v-slot="{ Component }">
            <transition name="slide-up">
                <component :is="Component" />
            </transition>
        </router-view>
</template>

<script lang="ts">
import { useSettingsStore } from  '../stores/settings'
import { useDisplay } from 'vuetify'

export default {
    name: 'Settings',
    data() {
        return {
            APP_VERSION: __APP_VERSION__,
            settings_general: [
                {
                    title: this.$t('settings.general.title'),
                    value: "general",
                    icon: "mdi-home",
                },
                {
                    title: this.$t('settings.speech.title'),
                    value: "stt",
                    icon: "mdi-microphone-outline"
                },
                {
                    title: this.$t('settings.appearance.title'),
                    value: "appearance",
                    icon: "mdi-palette"
                },
                {
                    title: this.$t('settings.wordreplace.title'),
                    value: "wordreplace",
                    icon: "mdi-swap-horizontal"
                },
            ],

            settings_osc: [
                {
                    title: this.$t('settings.osc.general.title'),
                    value: "osc",
                    icon: "mdi-transit-connection-variant"
                },
                {
                    title: this.$t('settings.osc.params.title'),
                    value: "oscparams",
                    icon: "mdi-format-list-bulleted-square"
                }
            ],
        }
    },
    methods: {
        open_external(link: string) {
            window.open(link, '_blank')
        },
        isElectron() {
            // Renderer process
            if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
                return true
            }
            // Main process
            if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
                return true
            }
            // Detect the user agent when the `nodeIntegration` option is set to true
            if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
                return true
            }
            return false
        }
    },
    mounted() {
        if (!this.isElectron())
            this.settings_osc = [this.settings_osc[0]]
    },
    setup() {
        const settingsStore = useSettingsStore()
        const { smAndDown } = useDisplay()

        settingsStore.drawer = !smAndDown.value

        return {
            settingsStore,
            smAndDown
        }
    } 
}
</script>


<style>
.slide-up-enter-active {
  transition: all 0.25s ease-out;
}

.slide-up-leave-active {
  transition: all 0s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>