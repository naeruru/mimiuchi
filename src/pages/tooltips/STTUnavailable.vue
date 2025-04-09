<template>
  <i18n-t keypath="settings.stt.unsupported.text">
    <template #link>
      <a
        class="text-primary pointer"
        @click="open_external('https://mimiuchi.com/')"
      >
        {{ $t('settings.stt.unsupported.link') }}
      </a>
    </template>
    <template #kaomoji>
      <span class="no-wrap">{{ $t('settings.stt.unsupported.kaomoji') }}</span>
    </template>
  </i18n-t>
</template>

<script setup lang="ts">
function open_external(url: string) {
  window.open(url, '_blank')
}
</script>

<style scoped>
.no-wrap {
  white-space: nowrap
}
</style>
