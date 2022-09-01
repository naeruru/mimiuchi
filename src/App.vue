<template>
  <v-app>
    <v-main>
      <router-view name="Header"></router-view>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">

export default {
  name: 'App',

  data: () => ({
    //
  }),
}
</script>
