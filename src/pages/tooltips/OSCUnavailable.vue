<template>
  <i18n-t keypath="settings.osc.general.unsupported.text">
    <template #link>
      <a
        class="text-primary pointer"
        @click="open_external('https://github.com/naeruru/mimiuchi/releases')"
      >
        {{ t('settings.osc.general.unsupported.link') }}
      </a>
    </template>
    <template #icon>
      <v-icon color="success" size="small">
        {{ t('settings.osc.general.unsupported.icon') }}
      </v-icon>
    </template>
    <template #kaomoji>
      <span class="no-wrap">{{ t('settings.osc.general.unsupported.kaomoji') }}</span>
    </template>
  </i18n-t>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

function open_external(url: string) {
  window.open(url, '_blank')
}
</script>

<style scoped>
.no-wrap {
  white-space: nowrap
}
</style>
