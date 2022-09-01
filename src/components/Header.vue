<template>
    <v-app-bar color="primary" app flat height="50">
      <v-container class="fill-height d-flex align-center">
        <v-avatar
            class="mr-10 ml-4"
            color="white"
            size="32"
        ><v-img :src="logo"></v-img></v-avatar>

        <v-app-bar-title>VRC Chatbox Tools</v-app-bar-title>

        <!-- <v-btn
          v-for="link in links"
          :key="link"
          text
        >
          {{ link }}
        </v-btn> -->

        <v-spacer></v-spacer>

        <v-btn icon>
            <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
        <v-btn icon>
            <v-icon>mdi-cog</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>
  </template>
  
<script>
    import logo from "../assets/naelogo2.png"

    export default {
        name: 'Header',
        data: () => ({
            logo: logo
        })
    }
</script>