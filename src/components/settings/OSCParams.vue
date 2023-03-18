<template>

    <v-card color="transparent" flat>
        <v-card-title>Custom Params</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
            <v-list v-if="osc_params.length">
                <v-list-item v-for="(param, i) in osc_params">
                    <v-card color="rgba(0, 0, 0, 0)">
                        <v-card-title class="d-flex align-center">
                            {{ param.route }}
                            <v-btn class="ml-4" flat variant="text" size="small" color="primary" append-icon="mdi-pencil">Edit</v-btn>
                        </v-card-title>
                        <v-divider></v-divider>
                        <v-card-text>
                            <v-row>
                                <!-- <v-col :cols="12">
                                    <v-text-field v-model="param.name" label="Name" hide-details></v-text-field>
                                </v-col> -->
                                <v-col :cols="12" :md="6">
                                    <v-text-field v-model="param.ip" label="Default OSC IP" variant="outlined" hide-details readonly></v-text-field>
                                </v-col>
                                <v-col>
                                    <v-text-field v-model="param.port" label="Default OSC Port" variant="outlined" hide-details readonly></v-text-field>
                                </v-col>

                                <v-col :cols="12">
                                    <strong>Trigger phrases:</strong>
                                </v-col>
                                <v-col :cols="12">
                                    <v-chip v-model="keyword.enabled" v-for="(keyword, i) in param.keywords" class="mx-1 mb-2" label color="secondary" size="small">
                                        {{ keyword.text }}
                                    </v-chip>
                                </v-col>
                                <v-col :cols="12">
                                    <strong>Assign phrases:</strong>
                                    <v-list density="compact">
                                        <v-list-item
                                            v-for="(assign, i) in param.assigns"
                                            :value="assign"
                                            :title="assign.keyword"
                                            :subtitle="`set ${assign.type} to ${assign.set}`"
                                        ></v-list-item>
                                    </v-list>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-list-item>
            </v-list>
            <p v-else>Use the + button to add a new custom param trigger!</p>
            <v-card class="mt-2" color="transparent" flat>
                <v-card-actions>
                    <v-btn color="primary" variant="outlined" size="small" icon="mdi-plus" @click="openAddDialog"></v-btn>
                </v-card-actions>
            </v-card>
        </v-card-text>

        <v-row justify="center">
            <v-dialog v-model="add_dialog" width="50vw" persistent>
                <v-card>
                    <v-card-title>Add custom param trigger</v-card-title>
                    <v-card-text>
                        <v-row>
                            <!-- <v-col :cols="12">
                                <v-text-field v-model="new_param.name" label="Name" hide-details></v-text-field>
                            </v-col> -->
                            <v-col :cols="12">
                                <v-text-field v-model="new_param.route" label="Param route" hide-details></v-text-field>
                            </v-col>
                            <v-col :cols="12" :md="6">
                                <v-text-field v-model="new_param.ip" label="OSC IP" hide-details></v-text-field>
                            </v-col>
                            <v-col>
                                <v-text-field v-model="new_param.port" label="OSC port" hide-details></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-divider class="mx-4"></v-divider>

                    <v-card-text class="mt-2">
                        <v-row>
                            <!-- <v-col :cols="12"><strong>Trigger phrases</strong></v-col> -->
                            <v-col>
                                <strong>Trigger phrases:</strong>
                                <v-chip v-if="!new_param.keywords.length" variant="text">none :c</v-chip>
                                <v-chip v-else v-model="keyword.enabled" v-for="(keyword, i) in new_param.keywords" class="mx-1 mb-2" label color="secondary" size="small" closable @click:close="remove_trigger(i)">
                                    {{ keyword.text }}
                                </v-chip>
                            </v-col>
                            <v-col :cols="12">
                                <v-text-field 
                                    v-model="trigger_phrase"
                                    label="Add trigger word"
                                    hide-details
                                    append-icon="mdi-plus"
                                    @click:append="add_trigger"
                                    @keydown.enter="add_trigger"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-divider class="mx-4"></v-divider>

                    <v-card-text class="mt-2">
                        <v-row>
                            <!-- <v-col :cols="12"><strong>Trigger phrases</strong></v-col> -->
                            <v-col :cols="12" >
                                <strong>Assign phrases:</strong>
                                <v-chip v-if="!new_param.assigns.length" variant="text">none :c</v-chip>
                                <v-list density="compact">
                                    <v-list-item
                                        v-for="(assign, i) in new_param.assigns"
                                        :value="assign"
                                        :title="assign.keyword"
                                        :subtitle="`set ${assign.type} to ${assign.set}`"
                                    ></v-list-item>
                                </v-list>
                            </v-col>
                            <v-col :cols="12" :lg="4">
                                <v-select v-model="new_assign.type" :items="var_types" hide-details label="Value type"></v-select>
                            </v-col>
                            <v-col :cols="12" :lg="8">
                                <v-text-field v-if="new_assign.type !== 'bool'" v-model="new_assign.set" hide-details label="Value"></v-text-field>
                                <v-select v-else v-model="new_assign.set" :items="['true', 'false']" hide-details label="Value"></v-select>
                            </v-col>
                            <v-col :cols="12">
                                <v-text-field 
                                    v-model="new_assign.keyword"
                                    label="Add assign word/phrase (ex: on)"
                                    hide-details
                                    append-icon="mdi-plus"
                                    @click:append="add_assign"
                                    @keydown.enter="add_assign"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    
                    <v-divider class="mt-4"></v-divider>
                    <div v-if="new_param.keywords.length && new_param.assigns.length" class="ma-2">
                        <v-list-item
                            :title="`Example phrase: 'set ${new_param.keywords[0].text } to ${ new_param.assigns[0].keyword }'`"
                            :subtitle="`${new_param.route} -> ${new_param.assigns[0].set}`"
                        ></v-list-item>
                    </div>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="add_dialog = false">cancel</v-btn>
                        <v-btn color="primary" @click="add_param">add</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-card>
</template>


<script lang="ts">

import { useSettingsStore } from  '../../stores/settings'

export default {
    name: 'SettingsGeneral',
    data: () => ({
        add_dialog: false,

        trigger_phrase: '',

        var_types: ['bool', 'int', 'float'],
        new_assign: {
            keyword: '',
            type: 'bool',
            set: true
        },

        new_param: {
            // name: '',
            ip: '',
            port: '',
            route: '/avatar/parameters/',
            keywords: [], // { enabled: true, text: '' }
            assigns: []
        }
    }),
    methods: {
        openAddDialog() {
            this.new_param.ip = this.osc_settings.ip
            this.new_param.port = this.osc_settings.port
            this.add_dialog = true
        },
        add_trigger() {
            if (this.trigger_phrase !== '') {
                this.new_param.keywords.push({ enabled: true, text: this.trigger_phrase })
                this.trigger_phrase = ''
            }
        },
        remove_trigger(i) {
            this.new_param.keywords.splice(i, 1)
        },
        add_assign() {
            this.new_param.assigns.push(this.new_assign)
            this.new_assign = {
                keyword: '',
                type: 'bool',
                set: true
            }
        },
        add_param() {
            this.osc_params.push(this.new_param)
            this.add_dialog = false
            this.new_param = {
                ip: '',
                port: '',
                route: '/avatar/parameters/',
                keywords: [],
                assigns: []
            }
        }
    },
    setup() {
        const settingsStore = useSettingsStore()

        const { osc_settings, osc_params } = settingsStore

        // Object.keys(osc_settings).forEach((setting, i) => this.settings.push({ [setting]: osc_settings[setting]}))

        // console.log(this.settings)

        return {
            osc_settings,
            osc_params
        }
    }
}
</script>