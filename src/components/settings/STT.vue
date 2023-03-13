<template>
    <v-card color="transparent" flat>
        <v-card-title>
            Speech-to-text
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
            meow {{ $route.fullPath }}
        </v-card-text>
    </v-card>
</template>


<script lang="ts">

export default {
    name: 'SettingsGeneral',
    data: () => ({

    }),
    methods: {

    },
    mounted() {
        
    }
}
</script>