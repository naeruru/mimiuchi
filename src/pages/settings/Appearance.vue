<template>
  <v-card
    :title="$t('settings.appearance.title')" :subtitle="$t('settings.appearance.description')" color="transparent"
    flat
  >
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col :cols="12">
          <p class="text-h6">
            {{ $t('settings.appearance.theme') }}
          </p>
        </v-col>
        <v-col>
          <v-btn
            v-for="(theme_id, key) in theme.themes.value"
            :key="theme_id.colors.primary"
            icon
            variant="flat"
            :color="theme_id.colors.primary"
            class="mr-2 mb-2 border-md"
            :class="(key === current_theme) ? 'theme_selected' : 'theme_unselected'"
            @click="set_theme(key)"
          >
            <v-tooltip
              activator="parent"
              open-on-click
              location="top"
              :text="to_title_case(key.replace('_', ' '))"
            />
          </v-btn>
        </v-col>
        <v-divider />
      </v-row>
      <v-row>
        <v-col :cols="12">
          <p class="text-h6">
            {{ $t('settings.appearance.text.title') }}
          </p>
        </v-col>
        <v-col :cols="12" :md="8">
          <v-autocomplete
            v-model="text.font"
            :items="fonts"
            item-title="name"
            :label="$t('settings.appearance.text.font_family')"
            variant="solo"
            hide-details
            return-object
            persistent-hint
            auto-select-first
            :disabled="!fonts.length"
          >
            <template #append>
              <v-select
                v-model="text.font.sub_type"
                :items="text.font.sub_types"
                item-title="style"
                :label="$t('settings.appearance.text.font_type')"
                variant="solo"
                hide-details
                return-object
                :disabled="!fonts.length"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :subtitle="item.raw.weight" />
                </template>
                <template #selection="{ item }">
                  {{ `${item.raw.style} ${item.raw.weight}` }}
                </template>
              </v-select>
            </template>
            <template #append-inner>
              <v-btn
                v-if="text.font.info"
                icon="mdi-information-outline"
                density="compact"
                @click="open_external(text.font.info)"
                @focus="null"
              />
            </template>
          </v-autocomplete>
        </v-col>
        <v-col :cols="12" :md="4">
          <v-text-field
            v-model="text.font_size"
            :label="$t('settings.appearance.text.font_size')"
            type="number"
            suffix="px"
            hide-details
          />
        </v-col>
        <v-col>
          <v-select
            v-model="text.new_line_delay"
            :items="line_delay_options"
            :label="$t('settings.appearance.text.new_line_delay.hint')"
            variant="solo"
            hide-details
          />
        </v-col>
        <v-divider />

        <v-col :cols="12" :md="12" class="pb-0">
          <v-card>
            <v-list-item :title="$t('settings.appearance.text.outline.enabled')">
              <template #append>
                <v-switch
                  v-model="text.outline"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col :cols="12" :md="12">
          <v-text-field
            v-model="text.outline_size"
            :disabled="!text.outline"
            :label="$t('settings.appearance.text.outline.size')"
            type="number"
            suffix="px"
            hide-details
          />
        </v-col>

        <v-divider />
        <v-col :cols="12" :md="12" class="pb-0">
          <v-card>
            <v-list-item :title="$t('settings.appearance.text.fade')">
              <template #append>
                <v-switch
                  v-model="text.enable_fade"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col :cols="12" :sm="6">
          <v-text-field
            v-model="text.hide_after"
            :disabled="!text.enable_fade"
            :label="$t('settings.appearance.text.fade_after')"
            :suffix="$t('settings.appearance.text.seconds')"
            type="number"
            hide-details
          />
        </v-col>
        <v-col :cols="12" :sm="6">
          <v-text-field
            v-model="text.fade_time"
            :disabled="!text.enable_fade"
            :label="$t('settings.appearance.text.fade_for')"
            :suffix="$t('settings.appearance.text.seconds')"
            type="number"
            hide-details
          />
        </v-col>
        <v-divider />
        <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between mt-1">
          <v-card-title class="text-subtitle-1">
            {{ $t('settings.appearance.text.color') }}
          </v-card-title>
          <v-btn :color="text.color" width="20vw" class="ma-2" flat>
            <v-menu activator="parent" :close-on-content-click="false">
              <v-color-picker v-model="text.color" :modes="['hexa']" flat class="pa-2" />
            </v-menu>
          </v-btn>
        </v-col>
        <v-divider />
        <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between mt-1">
          <v-card-title class="text-subtitle-1">
            {{ $t('settings.appearance.text.interim_color') }}
          </v-card-title>
          <v-btn :color="text.interim_color" width="20vw" class="ma-2" flat>
            <v-menu activator="parent" :close-on-content-click="false">
              <v-color-picker v-model="text.interim_color" :modes="['hexa']" flat class="pa-2" />
            </v-menu>
          </v-btn>
        </v-col>
        <v-divider />
        <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between mt-1">
          <v-card-title class="text-subtitle-1">
            {{ $t('settings.appearance.ui.color') }}
          </v-card-title>
          <v-btn :color="ui.color" width="20vw" class="ma-2" flat>
            <v-menu activator="parent" :close-on-content-click="false">
              <v-color-picker v-model="ui.color" :modes="['hexa']" flat class="pa-2" />
            </v-menu>
          </v-btn>
        </v-col>
        <v-divider />
        <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between mt-1">
          <v-card-title class="text-subtitle-1" :opacity="text.outline ? 100 : 50">
            {{ $t('settings.appearance.text.outline.color') }}
          </v-card-title>
          <v-btn :color="text.outline_color" width="20vw" class="ma-2" flat>
            <v-menu activator="parent" :close-on-content-click="false">
              <v-color-picker v-model="text.outline_color" :modes="['hexa']" flat class="pa-2" />
            </v-menu>
          </v-btn>
        </v-col>
        <v-divider />
      </v-row>
      <v-row>
        <v-col :cols="12">
          <p class="text-h6">
            {{ $t('settings.appearance.footer') }}
          </p>
        </v-col>
        <v-col>
          <v-select
            v-model="footer_size"
            :items="footer_size_options"
            :label="$t('settings.appearance.footer_size.hint')"
            variant="solo"
            hide-details
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'
import type { Font } from '@/helpers/get_fonts'
import { get_fonts } from '@/helpers/get_fonts'
import { useAppearanceStore } from '@/stores/appearance'

const { tm } = useI18n()

const theme = useTheme()

const line_delay_options: any[] = JSON.parse(JSON.stringify(tm('settings.appearance.text.new_line_delay.options')))
const footer_size_options: any[] = JSON.parse(JSON.stringify(tm('settings.appearance.footer_size.options')))

const fonts = ref< Font[]>([])

onMounted(async () => {
  await get_fonts()
    .then(res => fonts.value = res)
})

const { text, ui, current_theme, footer_size } = storeToRefs(useAppearanceStore())
watch(
  () => text.value.font,
  (v) => {
    v.sub_type = { style: 'regular', weight: '400' }
  },
)

function open_external(link: string | null) {
  if (link)
    window.open(link, '_blank')
}

function to_title_case(str: string): string {
  return str.replace(/\w\S*/g, (str2) => {
    return str2.charAt(0).toUpperCase() + str2.substring(1).toLowerCase()
  })
}

function set_theme(selected_theme: string) {
  theme.global.name.value = selected_theme // Immediately set the current theme to the selected theme
  current_theme.value = selected_theme // Store the setting
}
</script>

<style scoped>
.v-tooltip > :deep(.v-overlay__content) {
  background: #222 !important;
  color: #ddd !important;
  transition-property: opacity !important;
}

.theme_selected {
  border-color: rgba(255, 255, 255, 1) !important;
}

.theme_unselected {
  border-color: rgba(255, 255, 255, 0.25) !important;
}
</style>
