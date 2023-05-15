<template>
    <v-overlay
        v-model="overlay_state"
        transition="slide-x-transition"
        :contained="overlay_page === 0 ? false : true"
        :class="overlay_page === 0 ? 'align-center justify-center' : 'align-end justify-end'"
    >
        <v-card v-if="overlay_page == 0" :title="$t('welcome.intro.title', { name: app_name })" class="pa-2" max-width="500">
            <template v-slot:prepend>
                <v-avatar
                    color="transparent"
                ><v-img :src="logo"></v-img></v-avatar>
            </template>
            <v-card-text class="text-subtitle-1 py-2">
                {{  $t('welcome.intro.description', { name: app_name }) }}
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" @click="overlay_state = false">
                    {{  $t('welcome.intro.button') }}
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-scroll-x-transition>
        <v-card v-if="overlay_page == 1" :title="$t('welcome.controls.title')" class="mb-2 mr-8">
            <v-divider class="mb-2"></v-divider>
            <v-card-text class="text-subtitle-1 py-">
                <v-icon class="me-1" color="success">mdi-broadcast</v-icon>
                <v-icon class="me-1" color="error">mdi-broadcast-off</v-icon>
                <span class="subheading me-2">{{  $t('welcome.controls.broadcast') }}</span>
            </v-card-text>
            <v-card-text class="text-subtitle-1 py-2">
                <v-icon class="me-1" color="success">mdi-microphone</v-icon>
                <v-icon class="me-1" color="error">mdi-microphone-off</v-icon>
                <span class="subheading me-2">{{  $t('welcome.controls.mic') }}</span>
            </v-card-text>
            <v-card-text class="text-subtitle-1 py-2">
                <v-icon class="me-1">mdi-cog</v-icon>
                <span class="subheading me-2">{{  $t('welcome.controls.settings') }}</span>
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" @click="overlay_state = false">
                    {{  $t('welcome.controls.button') }}
                </v-btn>
            </v-card-actions>
        </v-card>
        </v-scroll-x-transition>
    </v-overlay>
</template>


<script lang="ts">
import { inject } from 'vue'
import logo from "../../assets/naelogo2.png"
import { useSettingsStore } from  '../../stores/settings'

export default {
    name: 'WelcomeOverlay',
    props: {
        overlay: Boolean,
        page: Number
    },
    data() {
        return {
            logo: logo,
            overlay_state: this.overlay,
            overlay_page: this.page
        }
    },
    watch: {
        overlay(new_val) {
            this.overlay_state = new_val
        },
        overlay_state(new_val) {
            if (new_val == false && this.overlay_page === 0) {
                this.overlay_state = true
                this.overlay_page++
            } else if (this.overlay_page === 1) {
                this.settingsStore.welcome = false
            }
        }
    },
    setup() {
        const app_name = inject('app_name')
        const settingsStore = useSettingsStore()

        return {
            app_name,
            settingsStore
        }
    }
}
</script>