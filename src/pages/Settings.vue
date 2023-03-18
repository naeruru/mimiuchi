
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

        </v-navigation-drawer>

        <router-view name="panel" />
    </div>
</template>

<script lang="ts">

export default {
    name: 'Settings',
    data: () => ({

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


        // settings_list: [
        //     {
        //         type: "subheader",
        //         title: "General",
        //     },
        //     {
        //         title: "General",
        //         props: {
        //             prependIcon: 'mdi-home',
        //         },
        //         value: 1,
        //     },
        //     {
        //         title: "Speech-to-Text",
        //         props: {
        //             prependIcon: 'mdi-microphone-outline',
        //         },
        //         value: 2,
        //     },
        //     {
        //         title: "Appearance",
        //         props: {
        //             prependIcon: 'mdi-palette',
        //         },
        //         value: 3,
        //     },
        //     {
        //         type: "divider",
        //     },
        //     {
        //         type: "subheader",
        //         title: "OSC",
        //     },
        //     {
        //         title: "General",
        //         props: {
        //             prependIcon: 'mdi-transit-connection-variant',
        //         },
        //         value: 4,
        //     },
        //     {
        //         title: "Custom Params",
        //         props: {
        //             prependIcon: 'mdi-format-list-bulleted-square',
        //         },
        //         value: 5,
        //     },
        // ]
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
            this.settings_osc = null
    }
}
</script>