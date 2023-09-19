<template>
    <v-card :title="$t('settings.appearance.title')" :subtitle="$t('settings.appearance.description')" color="transparent" flat>
        <v-divider></v-divider>
        <v-card-text>
            <v-row>
                <v-col :cols="12">
                    <p class="text-h6" label color="secondary">{{ $t('settings.appearance.text.title') }}</p>
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
                        :disabled="!fonts.length"
                    >
                        <template v-slot:append>
                            <v-select
                                v-model="appearanceStore.text.font.sub_type"
                                :items="appearanceStore.text.font.sub_types"
                                :label="$t('settings.appearance.text.font_type')"
                                variant="solo"
                                hide-details
                                :disabled="!fonts.length"
                            ></v-select>
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
                    ></v-text-field>
                </v-col>
                <v-col :cols="12" :sm="6" class="d-flex">
                        <v-checkbox-btn
                            v-model="appearanceStore.text.enable_fade"
                            class="pe-2"
                        ></v-checkbox-btn>
                        <v-text-field
                            v-model="appearanceStore.text.hide_after"
                            :disabled="!appearanceStore.text.enable_fade"
                            :label="$t('settings.appearance.text.fade_after')"
                            :suffix="$t('settings.appearance.text.seconds')"
                            type="number"
                            hide-details
                        >
                        </v-text-field>
                </v-col>
                <v-col :cols="12" :sm="6">
                    <v-text-field 
                        v-model="appearanceStore.text.fade_time" 
                        :disabled="!appearanceStore.text.enable_fade"
                        :label="$t('settings.appearance.text.fade_for')"
                        :suffix="$t('settings.appearance.text.seconds')"
                        type="number"
                        hide-details
                    ></v-text-field>
                </v-col>
                <v-col>
                    <v-select
                        v-model="appearanceStore.text.new_line_delay"
                        :items="$tm('settings.appearance.text.new_line_delay.options')"
                        :label="$t('settings.appearance.text.new_line_delay.hint')"
                        hide-details
                    ></v-select>
                </v-col>
                <v-divider></v-divider>
                <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between mt-1">
                    <v-card-title class="text-subtitle-1">{{ $t('settings.appearance.text.color') }}</v-card-title>
                    <v-btn :color="appearanceStore.text.color" width="20vw" class="ma-2" flat>
                        <v-menu activator="parent" :close-on-content-click="false">
                            <v-color-picker v-model="appearanceStore.text.color" :modes="['hexa']" flat class="pa-2"></v-color-picker>
                        </v-menu>
                    </v-btn>
                </v-col>
                <v-divider></v-divider>
                <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between mt-1">
                    <v-card-title class="text-subtitle-1">{{ $t('settings.appearance.text.interim_color') }}</v-card-title>
                    <v-btn :color="appearanceStore.text.interim_color" width="20vw" class="ma-2" flat>
                        <v-menu activator="parent" :close-on-content-click="false">
                            <v-color-picker v-model="appearanceStore.text.interim_color" :modes="['hexa']" flat class="pa-2"></v-color-picker>
                        </v-menu>
                    </v-btn>
                </v-col>
                <v-divider></v-divider>
                <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between mt-1">
                    <v-card-title class="text-subtitle-1">{{ $t('settings.appearance.ui.color') }}</v-card-title>
                    <v-btn :color="appearanceStore.ui.color" width="20vw" class="ma-2" flat>
                        <v-menu activator="parent" :close-on-content-click="false">
                            <v-color-picker v-model="appearanceStore.ui.color" :modes="['hexa']" flat class="pa-2"></v-color-picker>
                        </v-menu>
                    </v-btn>
                </v-col>
                <v-divider></v-divider>
            </v-row>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">
import { useAppearanceStore } from '../../stores/appearance';
import { get_fonts } from '../../helpers/get_fonts'


export default {
    name: 'SettingsGeneral',
    data() {
        return {
            fonts: [] as any[],
        }
    },
    methods: {

    },
    watch: {
        'appearanceStore.text.font': (v) => {
            v.sub_type = 'regular'
        }
    },
    async mounted() {
        this.fonts = await get_fonts()
    },
    setup() {
        const appearanceStore = useAppearanceStore()

        return {
            appearanceStore
        }
    }
}
</script>