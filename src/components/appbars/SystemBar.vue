<template>
      <v-system-bar class="systembar" window>
        <v-icon class="me-2" icon="mdi-weather-night"></v-icon>
  
        <span class="font-weight-medium">{{ APP_NAME }}</span>
  
        <v-spacer></v-spacer>
  
        <v-btn class="systembar-button" icon="mdi-minus" variant="text"></v-btn>
  
        <v-btn icon="mdi-checkbox-blank-outline" variant="text" class="systembar-button ms-2"></v-btn>
  
        <v-btn icon="mdi-close" variant="text" class="systembar-button ms-2"></v-btn>
      </v-system-bar>
</template>
  
  <script lang="ts">
  
  export default {
    name: 'App',
    data() {
        return {
          APP_NAME: __APP_NAME__
        }
    },
  }
  </script>
  
  <style>
  
  .systembar {
    -webkit-app-region: drag;
  }
  
  .systembar-button {
    -webkit-app-region: no-drag;
  }
  </style>