<template>
    <v-app-bar color="primary" app flat height="50">
      <v-container class="mb-7 fill-height d-flex align-center">
        <v-avatar
            class="me-10 ms-4"
            color="white"
            size="32"
        ><v-img :src="logo"></v-img></v-avatar>

        <v-app-bar-title>
          name pending （＾＾）
          <v-chip>BETA</v-chip>
        </v-app-bar-title>

        <!-- <v-btn
          v-for="link in links"
          :key="link"
          text
        >
          {{ link }}
        </v-btn> -->

        <v-spacer></v-spacer>

        <v-btn icon @click="$router.push({ path: '/' })" :color="$route.name === 'home' ? 'secondary' : 'white'">
            <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn icon @click="$router.push({ path: '/settings/general' })" :color="$route.fullPath.startsWith('/settings') ? 'secondary' : 'white'">
            <v-icon>mdi-cog</v-icon>
        </v-btn>
        <v-btn icon @click="open_external('https://github.com/naexris/chatbox-tools')" color="white">
            <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>
  </template>
  
<script lang='ts'>
    import logo from "../assets/naelogo2.png"

    export default {
        name: 'Header',
        data: () => ({
            logo: logo
        }),
        methods: {
          open_external(link: string) {
            window.open(link, '_blank')
          }
        }
    }
</script>