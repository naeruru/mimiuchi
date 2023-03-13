<template>
    <v-card color="transparent" flat>
        <v-card-title>
            General Settings
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
            meow {{ $route.fullPath }}
        </v-card-text>
    </v-card>
</template>


<script lang="ts">

import { useSettingsStore } from  '../../stores/settings'

export default {
    name: 'SettingsGeneral',
    data: () => ({

    }),
    methods: {

    },
    mounted() {
        // example
        const settingsStore = useSettingsStore()
        settingsStore.increment()
        // console.log(settingsStore.count)
    }
}
</script>