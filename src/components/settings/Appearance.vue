<template>
  <v-card :title="$t('settings.appearance.title')" :subtitle="$t('settings.appearance.description')" color="transparent" flat>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col :cols="12">
          <p class="text-h6" label color="secondary">
            {{ $t('settings.appearance.text.title') }}
          </p>
        </v-col>
        <v-col :cols="12" :md="8">
          <v-autocomplete
            v-model="appearanceStore.text.font"
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
                v-model="appearanceStore.text.font.sub_type"
                :items="appearanceStore.text.font.sub_types"
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
                v-if="appearanceStore.text.font.info"
                icon="mdi-information-outline"
                density="compact"
                @click="open_external(appearanceStore.text.font.info)"
                @focus="null"
              />
            </template>
          </v-autocomplete>
        </v-col>
        <v-col :cols="12" :md="4">
          <v-text-field
            v-model="appearanceStore.text.font_size"
            :label="$t('settings.appearance.text.font_size')"
            type="number"
            suffix="px"
            hide-details
          />
        </v-col>
        <v-col>
          <v-select
            v-model="appearanceStore.text.new_line_delay"
            :items="line_delay_options"
            :label="$t('settings.appearance.text.new_line_delay.hint')"
            variant="solo"
            hide-details
          />
        </v-col>
        <v-divider />
        <v-col :cols="12" :md="12" class="pb-0">
          <v-card>
            <v-list-item :title="$t('settings.appearance.text.fade')">
              <template #append>
                <v-switch
                  v-model="appearanceStore.text.enable_fade"
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
            v-model="appearanceStore.text.hide_after"
            :disabled="!appearanceStore.text.enable_fade"
            :label="$t('settings.appearance.text.fade_after')"
            :suffix="$t('settings.appearance.text.seconds')"
            type="number"
            hide-details
          />
        </v-col>
        <v-col :cols="12" :sm="6">
          <v-text-field
            v-model="appearanceStore.text.fade_time"
            :disabled="!appearanceStore.text.enable_fade"
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
          <v-btn :color="appearanceStore.text.color" width="20vw" class="ma-2" flat>
            <v-menu activator="parent" :close-on-content-click="false">
              <v-color-picker v-model="appearanceStore.text.color" :modes="['hexa']" flat class="pa-2" />
            </v-menu>
          </v-btn>
        </v-col>
        <v-divider />
        <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between mt-1">
          <v-card-title class="text-subtitle-1">
            {{ $t('settings.appearance.text.interim_color') }}
          </v-card-title>
          <v-btn :color="appearanceStore.text.interim_color" width="20vw" class="ma-2" flat>
            <v-menu activator="parent" :close-on-content-click="false">
              <v-color-picker v-model="appearanceStore.text.interim_color" :modes="['hexa']" flat class="pa-2" />
            </v-menu>
          </v-btn>
        </v-col>
        <v-divider />
        <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between mt-1">
          <v-card-title class="text-subtitle-1">
            {{ $t('settings.appearance.ui.color') }}
          </v-card-title>
          <v-btn :color="appearanceStore.ui.color" width="20vw" class="ma-2" flat>
            <v-menu activator="parent" :close-on-content-click="false">
              <v-color-picker v-model="appearanceStore.ui.color" :modes="['hexa']" flat class="pa-2" />
            </v-menu>
          </v-btn>
        </v-col>
        <v-divider />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useAppearanceStore } from '@/stores/appearance'
import { get_fonts } from '@/helpers/get_fonts'

export default {
  name: 'SettingsGeneral',
  setup() {
    const appearanceStore = useAppearanceStore()

    return {
      appearanceStore,
    }
  },
  data() {
    return {
      fonts: [] as any[],
      line_delay_options: [] as any[],
    }
  },
  watch: {
    'appearanceStore.text.font': (v) => {
      v.sub_type = { style: 'regular', weight: '400' }
    },
  },
  async mounted() {
    this.fonts = await get_fonts()
    this.line_delay_options = JSON.parse(JSON.stringify(this.$tm('settings.appearance.text.new_line_delay.options')))
  },
  methods: {
    open_external(link: string | null) {
      if (link)
        window.open(link, '_blank')
    },
  },
}
</script>
