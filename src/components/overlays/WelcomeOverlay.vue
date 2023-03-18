<template>
    <v-overlay
        v-model="overlay_state"
        transition="slide-x-transition"
        :contained="overlay_page === 0 ? false : true"
        :class="overlay_page === 0 ? 'align-center justify-center' : 'align-end justify-end'"
    >
        <v-card v-if="overlay_page == 0" title="Welcome to Caption Tools!" class="pa-2" max-width="500">
            <template v-slot:prepend>
                <v-avatar
                    color="transparent"
                ><v-img :src="logo"></v-img></v-avatar>
            </template>
            <v-card-text class="text-subtitle-1 py-2">
                Caption tools is a customizable, osc enabled, text interface for displaying spoken (or typed) words as text or relaying it to other applications (like VRChat).
                Its customizability (WIP) also allows you to effortlessly display the resulting text log in applications like OBS at the same time.
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" @click="overlay_state = false">next</v-btn>
            </v-card-actions>
        </v-card>
        <v-scroll-x-transition>
        <v-card v-if="overlay_page == 1" class="mb-2 mr-8">
            <v-card-title>
                Controls
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="text-subtitle-1 py-2">
                <v-icon class="me-1" color="success">mdi-broadcast</v-icon>
                <v-icon class="me-1" color="error">mdi-broadcast-off</v-icon>
                <span class="subheading me-2">Toggle OSC broadcasting (requires desktop app)</span>
            </v-card-text>
            <v-card-text class="text-subtitle-1 py-2">
                <v-icon class="me-1" color="success">mdi-microphone</v-icon>
                <v-icon class="me-1" color="error">mdi-microphone-off</v-icon>
                <span class="subheading me-2">Toggle speech-to-text (requires browser permission)</span>
            </v-card-text>
            <v-card-text class="text-subtitle-1 py-2">
                <v-icon class="me-1">mdi-cog</v-icon>
                <span class="subheading me-2">Open settings panel</span>
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" @click="overlay_state = false">close</v-btn>
            </v-card-actions>
        </v-card>
        </v-scroll-x-transition>
    </v-overlay>
</template>


<script lang="ts">
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
        },
        // overlay_state(new_val) {
        //     if (new_val === false) this.$emit("close")
        // }
    },
    setup() {
        const settingsStore = useSettingsStore()

        return {
            settingsStore
        }
    }
}
</script>