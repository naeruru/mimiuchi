
<template>
    <div>
        <v-navigation-drawer permanent>
            <v-list density="compact" nav>
                <v-list-subheader>Settings</v-list-subheader>
                <v-list-item
                    v-for="(setting, i) in settings_general"
                    @click="$router.push({ path: `/settings/${setting.value}` })"
                    :prepend-icon="setting.icon"
                    :title="setting.title"
                    :value="setting.value"
                    :active="(setting.value === $route.query.p)"
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
                ></v-list-item>
                <p v-else class="text-caption">OSC settings are available on the desktop app</p>
            </v-list>

            <!-- <v-list :items="settings_list" density="compact" nav></v-list> -->
            <template v-slot:append>
                <v-col class="d-flex justify-right"><strong>v{{ APP_VERSION }}</strong></v-col>
                
            </template>

        </v-navigation-drawer>

        <router-view name="panel" />

        <v-footer app class="d-flex flex-column" height="55">
            <div class="d-flex w-100 align-center">
                    <div class="d-flex w-100 align-center">

                        <v-spacer></v-spacer>
                        <v-divider class="mr-4" vertical></v-divider>
                        <v-btn @click="$router.push({ path: '/' })" color="transparent"  size="small" icon flat>
                            <v-icon>mdi-home</v-icon>
                        </v-btn>
                    </div>

            </div>
        </v-footer>
    </div>
</template>

<script lang="ts">

export default {
    name: 'Settings',
    data: () => ({
        APP_VERSION: APP_VERSION,
        settings_general: [
            {
                title: "General",
                value: "general",
                icon: "mdi-home",
            },
            {
                title: "Speech-to-Text",
                value: "stt",
                icon: "mdi-microphone-outline"
            },
            {
                title: "Appearance",
                value: "appearance",
                icon: "mdi-palette"
            },
            {
                title: "Word Replace",
                value: "wordreplace",
                icon: "mdi-swap-horizontal"
            },
        ],

        settings_osc: [
            {
                title: "General",
                value: "osc",
                icon: "mdi-transit-connection-variant"
            },
            {
                title: "Custom Params",
                value: "oscparams",
                icon: "mdi-format-list-bulleted-square"
            }
        ],
    }),
    methods: {
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
    }
}
</script>