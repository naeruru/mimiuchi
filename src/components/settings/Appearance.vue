<template>
    <v-card color="transparent" flat>
        <v-card-title>
            Appearance
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
            <v-row>
                <v-col :cols="12">
                    <p class="text-h6" label color="secondary">Text Settings</p>
                </v-col>
                <v-col :cols="12">
                    <v-text-field
                        v-model="appearanceStore.text.font_size"
                        label="Font size"
                        type="number"
                        suffix="px"
                        hide-details
                    ></v-text-field>
                </v-col>
                <v-col :cols="12" :md="6" class="d-flex">
                        <v-checkbox-btn
                        v-model="appearanceStore.text.enable_fade"
                        class="pe-2"
                        ></v-checkbox-btn>
                        <v-text-field
                            v-model="appearanceStore.text.hide_after"
                            :disabled="!appearanceStore.text.enable_fade"
                            label="Fade text after"
                            suffix="seconds"
                            type="number"
                            hide-details
                        ></v-text-field>
                </v-col>
                <v-col :cols="12" :md="6">
                    <v-text-field 
                        v-model="appearanceStore.text.fade_time" 
                        :disabled="!appearanceStore.text.enable_fade"
                        label="Fade text for"
                        suffix="seconds"
                        type="number"
                        hide-details
                    ></v-text-field>
                </v-col>
                <v-col :cols="12" :md="12">
                    <v-card class="mt-2">
                        <v-col class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="text-subtitle-1">Text color</v-card-title>
                            <v-btn :color="appearanceStore.text.color" width="20vw" class="ma-2" flat>
                                <v-menu activator="parent" :close-on-content-click="false">
                                    <v-color-picker v-model="appearanceStore.text.color" :modes="['hexa']" flat class="pa-2"></v-color-picker>
                                </v-menu>
                            </v-btn>
                        </v-col>
                    </v-card>
                </v-col>
                <v-col :cols="12" :md="12">
                    <v-card class="mt-2">
                        <v-col class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="text-subtitle-1">Interim text color</v-card-title>
                            <v-btn :color="appearanceStore.text.interim_color" width="20vw" class="ma-2" flat>
                                <v-menu activator="parent" :close-on-content-click="false">
                                    <v-color-picker v-model="appearanceStore.text.interim_color" :modes="['hexa']" flat class="pa-2"></v-color-picker>
                                </v-menu>
                            </v-btn>
                        </v-col>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mt-6">
                <v-divider class="mx-2"></v-divider>
                <v-col :cols="12">
                    <p class="text-h6" label color="secondary">UI Settings</p>
                </v-col>
                <v-col :cols="12" :md="12">
                    <v-card>
                        <v-col class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="text-subtitle-1">Background color</v-card-title>
                            <v-btn :color="appearanceStore.ui.color" width="20vw" class="ma-2" flat>
                                <v-menu activator="parent" :close-on-content-click="false">
                                    <v-color-picker v-model="appearanceStore.ui.color" :modes="['hexa']" flat class="pa-2"></v-color-picker>
                                </v-menu>
                            </v-btn>
                        </v-col>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">
import { useAppearanceStore } from '../../stores/appearance';


export default {
    name: 'SettingsGeneral',
    data: () => ({
        //
    }),
    methods: {

    },
    setup() {
        const appearanceStore = useAppearanceStore()

        return {
            appearanceStore
        }
    }
}
</script>