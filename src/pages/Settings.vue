<template>
        <!-- <v-navigation-drawer :width="Math.ceil((window_size.x * .2) / 10) * 10" v-model="settingsStore.drawer" :permanent="!smAndDown" floating v-resize="on_resize">
            {{ window_size }} {{ Math.ceil((window_size.x * .2) / 2) * 2 }}
        </v-navigation-drawer> -->
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
                    color="primary"
                ></v-list-item>

                <v-divider></v-divider>
                <v-list-subheader>{{ $t('settings.connections.title') }}</v-list-subheader>
                <v-list-item
                    v-for="(setting, i) in connections"
                    @click="$router.push({ path: `/settings/${setting.value}` })"
                    :prepend-icon="setting.icon"
                    :title="setting.title"
                    :value="setting.value"
                    :active="(setting.value === $route.name)"
                    color="primary"
                ></v-list-item>

                <v-divider></v-divider>
                <v-list-subheader>{{ $t('settings.osc.title') }}</v-list-subheader>
                <v-list-item
                    v-for="(setting, i) in settings_osc"
                    @click="$router.push({ path: `/settings/${setting.value}` })"
                    :prepend-icon="setting.icon"
                    :title="setting.title"
                    :value="setting.value"
                    :active="(setting.value === $route.name)"
                    color="primary"
                ></v-list-item>
                <v-divider></v-divider>
            </v-list>

            <!-- <v-list :items="settings_list" density="compact" nav></v-list> -->
            <template v-slot:append>
                <v-divider></v-divider>
                <v-col class="d-flex justify-right mt-1">
                    <v-spacer></v-spacer>
                    <v-btn size="small" variant="flat" prepend-icon="mdi-tag" @click="open_external('https://github.com/naeruru/mimiuchi/releases')">v{{ APP_VERSION }}</v-btn>
                </v-col>
                
            </template>

        </v-navigation-drawer>

        <div id="settings" class="d-flex fill-height justify-center settings">
            <v-col class="pa-0" cols="12" md="10" lg="8" xl="6">
                <router-view name="panel" v-slot="{ Component }">
                    <transition name="slide-up">
                            <component :is="Component" />
                    </transition>
                </router-view>
            </v-col>
        </div>
</template>

<script lang="ts">
import is_electron from '../helpers/is_electron'
import { useSettingsStore } from  '../stores/settings'
import { useDisplay } from 'vuetify'

export default {
    name: 'Settings',
    data() {
        return {
            APP_VERSION: __APP_VERSION__,
            window_size: {
                x: 0,
                y: 0
            }
        }
    },
    computed: {
        outer_size: (() => is_electron() ? '140px' : '105px'),
        settings_general() {
            return [
                {
                    title: this.$t('settings.general.title'),
                    value: "general",
                    icon: "mdi-home",
                },
                {
                    title: this.$t('settings.appearance.title'),
                    value: "appearance",
                    icon: "mdi-palette"
                },
                {
                    title: this.$t('settings.stt.title'),
                    value: "stt",
                    icon: "mdi-microphone-outline"
                },
                {
                    title: this.$t('settings.tts.title'),
                    value: "tts",
                    icon: "mdi-account-voice"
                },
                {
                    title: this.$t('settings.word_replace.title'),
                    value: "wordreplace",
                    icon: "mdi-swap-horizontal"
                },
            ]
        },
        connections() {
            return [
                {
                    title: this.$t('settings.connections.title'),
                    value: "connections",
                    icon: "mdi-broadcast",
                },
            ]
        },
        settings_osc() {
            const settings_osc =  [
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
            ]
            if (is_electron()) return settings_osc
            else return settings_osc.slice(0, 1)
        }
    },
    methods: {
        open_external(link: string) {
            window.open(link, '_blank')
        }
    },
    mounted() {
        // if (!is_electron())
        //     this.settings_osc = [this.settings_osc[0]]
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
.settings {
    overflow-y: auto;
    max-height: calc(100svh - v-bind(outer_size));
}

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