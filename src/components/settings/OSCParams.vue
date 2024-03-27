<template>
  <v-card color="transparent" flat class="pb-16">
    <template v-slot:title>
      <span v-html="$t('settings.osc.params.title')"></span>
      <v-chip prepend-icon="mdi-alert-circle-outline" color="warning" class="ml-2" variant="elevated" size="small">
        Subject to change
      </v-chip>
    </template>
    <template v-slot:subtitle>
      <span>Add custom param triggers here</span>
    </template>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col :cols="10" class="d-flex align-center">
          <v-select
            v-model="oscStore.current_profile"
            label="Select a profile"
            :items="Object.keys(oscStore.osc_profiles)"
            variant="outlined"
            :menu-props="{ closeOnContentClick: true }"
          >
            <template v-slot:item="{ item }">
              <v-list-item @click="oscStore.current_profile = item.title">
                <v-list-item-content class="d-flex align-center">
                  <v-list-item-title class="flex-grow-1">
                    {{ item.title }}
                  </v-list-item-title>
                  <v-list-item-action>
                    <v-btn icon variant="plain" @click.stop="delete_profile(item.title)">
                      <v-icon v-if="item.title !== 'Default'">mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-select>
        </v-col>
        <v-card-actions class="pa-3" style="height: 80px">
          <v-btn color="primary" variant="outlined" size="small" icon="mdi-plus" @click="openAddProfileDialog" />
        </v-card-actions>
      </v-row>
      <v-card v-if="Object.keys(oscStore.osc_profiles[oscStore.current_profile]).length > 0" v-for="(param, i) in oscStore.osc_profiles[oscStore.current_profile]" class="mb-4">
        <v-card color="rgba(0, 0, 0, 0)">
          <v-card-title class="d-flex align-center">
            {{ param.route }}
            <v-spacer />
            <v-btn class="ml-4" flat variant="text" size="small" color="primary" append-icon="mdi-pencil" @click="openEditDialog(i)">
              Edit
            </v-btn>
            <v-btn class="ml-4" flat variant="text" size="small" color="error" append-icon="mdi-delete" @click="delete_param(i)">
              Delete
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-row>
              <!-- <v-col :cols="12">
                                <v-text-field v-model="param.name" label="Name" hide-details></v-text-field>
                            </v-col> -->
              <v-col :cols="12" :md="6">
                <v-text-field v-model="param.ip" label="Default OSC IP" variant="outlined" hide-details readonly />
              </v-col>
              <v-col>
                <v-text-field v-model="param.port" label="Default OSC Port" variant="outlined" hide-details readonly />
              </v-col>

              <v-col :cols="12">
                <strong>Trigger phrases:</strong>
              </v-col>
              <v-col :cols="12">
                <v-chip v-for="(keyword, i) in param.keywords" v-model="keyword.enabled" class="mx-1 mb-2" label color="secondary" size="small">
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
                    class="assignment-display"
                  />
                </v-list>
              </v-col>
              <v-col :cols="12">
                <strong>Behavior:</strong>
                <v-list density="compact">
                  <v-list-item
                    :value="param"
                    :title="param.behavior"
                  />
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card>
      <p v-else>
        Use the + button to add a new custom param trigger!
      </p>
      <v-card class="mt-2" color="transparent" flat>
        <v-card-actions>
          <v-btn color="primary" variant="outlined" size="small" icon="mdi-plus" @click="openAddParamDialog" />
        </v-card-actions>
      </v-card>
    </v-card-text>
    <!-- Profile Dialog -->
    <v-row justify="center">
      <v-dialog v-model="profile_dialog" width="50vw">
        <v-card>
          <v-card-title>Add new profile</v-card-title>
          <v-card-text>
            <v-row>
              <v-col :cols="12">
                <v-text-field v-model="new_profile_name" label="Profile name" hide-details />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn @click="profile_dialog = false">
              cancel
            </v-btn>
            <v-btn color="primary" @click="confirmNewProfile">
              confirm
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- Profile Delete Dialog -->
    <v-row justify="center">
      <v-dialog v-model="profile_delete_dialog" width="50vw">
        <v-card>
          <v-card-title>Delete profile</v-card-title>
          <v-card-text>{{ `Are you sure that you want to delete "${profile_delete_target}"?` }}</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="profile_delete_dialog = false">
              cancel
            </v-btn>
            <v-btn color="primary" @click="delete_profile_final()">
              confirm
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- Param Trigger Dialog -->
    <v-row justify="center">
      <v-dialog v-model="param_dialog" width="50vw" persistent>
        <v-card>
          <v-card-title>{{ `${!editing ? 'Add' : 'Edit'} custom param trigger` }}</v-card-title>
          <v-card-text>
            <v-row>
              <!-- <v-col :cols="12">
                                <v-text-field v-model="new_param.name" label="Name" hide-details></v-text-field>
                            </v-col> -->
              <v-col :cols="12">
                <v-text-field v-model="new_param.route" label="Param route" hide-details />
              </v-col>
              <v-col :cols="12" :md="6">
                <v-text-field v-model="new_param.ip" label="OSC IP" hide-details />
              </v-col>
              <v-col>
                <v-text-field v-model="new_param.port" label="OSC port" hide-details />
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider class="mx-4" />

          <v-card-text class="mt-2">
            <v-row>
              <!-- <v-col :cols="12"><strong>Trigger phrases</strong></v-col> -->
              <v-col>
                <strong>Trigger phrases:</strong>
                <v-chip v-if="!new_param.keywords.length" variant="text">
                  none :c
                </v-chip>
                <v-chip v-for="(keyword, i) in new_param.keywords" v-else v-model="keyword.enabled" class="mx-1 mb-2" label color="secondary" size="small" closable @click:close="remove_trigger(i)">
                  {{ keyword.text }}
                </v-chip>
              </v-col>
              <v-col :cols="12">
                <v-text-field
                  v-model="trigger_phrase"
                  label="Add trigger word/phrase"
                  hide-details
                  append-icon="mdi-plus"
                  @click:append="add_trigger"
                  @keydown.enter="add_trigger"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider class="mx-4" />

          <v-card-text class="mt-2">
            <v-row>
              <v-col :cols="12">
                <strong>Assign phrases:</strong>
                <v-chip v-if="!new_param.assigns.length" variant="text">
                  none :c
                </v-chip>
                <v-list density="compact">
                  <v-list-item
                    v-for="(assign, i) in new_param.assigns"
                    :value="assign"
                    :title="assign.keyword"
                    :subtitle="`set ${assign.type} to ${assign.set}`"
                    @click="remove_assign(i)"
                    class="assignment-editable"
                  />
                </v-list>
              </v-col>
              <v-col :cols="12" :lg="4">
                <v-select v-model="new_assign.type" :items="var_types" hide-details label="Value type" @update:modelValue="validate_assign_value_field" />
              </v-col>
              <v-col :cols="12" :lg="8">
                <v-text-field v-if="new_assign.type !== 'bool'" v-model="new_assign.set" hide-details label="Value" type="number" @input="validate_assign_value_field" />
                <v-select v-else v-model="new_assign.set" :items="['true', 'false'] as string[]" hide-details label="Value" />
              </v-col>
              <v-col :cols="12">
                <v-text-field
                  v-model="new_assign.keyword"
                  label="Add assign word/phrase (ex: on)"
                  hide-details
                  append-icon="mdi-plus"
                  @click:append="add_assign"
                  @keydown.enter="add_assign"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider class="mx-4" />

          <v-card-text class="mt-2">
            <v-row>
              <v-col :cols="12">
                <strong>Behavior:</strong>
              </v-col>
              <v-col :cols="12">
                <v-select v-model="new_param.behavior" :items="['Constant', 'Pulse'] as string[]" hide-details label="Activation signal" />
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider class="mt-4" />

          <div v-if="new_param.keywords.length && new_param.assigns.length" class="ma-2">
            <v-list-item
              :title="`Example phrase: 'set ${new_param.keywords[0]?.text} to ${new_param.assigns[0]?.keyword}'`"
              :subtitle="`${new_param.route} -> ${new_param.assigns[0]?.set}`"
            />
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="closeDialog">
              cancel
            </v-btn>
            <v-btn color="primary" @click="confirm_param">
              confirm
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-card>
</template>

<style>
.assignment-display {
  pointer-events: none;
}

.assignment-editable:hover {
  text-decoration: line-through;
}
</style>

<script lang="ts">
import { useOSCStore } from '@/stores/osc'

interface Param {
  route: string
}
interface Keyword {
  enabled: boolean
  text: string
}
interface Assign {
  keyword: string
  type: string
  set: string // Receive user-input as a string. Parse it when finally sending a payload.
}

export default {
  name: 'SettingsGeneral',
  setup() {
    const oscStore = useOSCStore()

    // const { osc_settings, osc_params } = oscStore

    // Object.keys(osc_settings).forEach((setting, i) => this.settings.push({ [setting]: osc_settings[setting]}))

    // console.log(this.settings)

    return {
      oscStore,
    }
  },
  data: () => ({
    profile_dialog: false,
    new_profile_name: '',

    profile_delete_dialog: false,
    profile_delete_target: '',

    param_dialog: false,

    editing_index: 0,
    editing: false,

    trigger_phrase: '',

    var_types: ['bool', 'int', 'float'],
    new_assign: {
      keyword: '',
      type: 'bool',
      set: 'true',
    },

    new_param: {
      // name: '',
      ip: '',
      port: '',
      route: '/avatar/parameters/',
      keywords: [] as Keyword[], // [{enabled: boolean, text: string}?],
      assigns: [] as Assign[], // [{keyword: string, type: string, set: string}?]

      // The behavior or activation signal of the param trigger.
      // "Constant" (Default): set the parameter to this value.
      // "Pulse": set the parameter to this value, then reset it (0, 0.0, false) after some time.
      behavior: 'Constant',
    },
  }),
  methods: {
    openAddProfileDialog() {
      this.new_profile_name = ''

      this.profile_dialog = true
    },
    confirmNewProfile() {
      if (!this.new_profile_name.trim()) {
        return
      }

      if (this.new_profile_name in this.oscStore.osc_profiles) // The profile name is already being used.
        return

      this.oscStore.osc_profiles[this.new_profile_name] = []
      this.oscStore.current_profile = this.new_profile_name

      // Reset the dialog's field.
      this.new_profile_name = ''

      this.profile_dialog = false
    },
    openAddParamDialog() {
      // Reset the dialog's fields.
      this.new_param = {
        ip: this.oscStore.ip,
        port: this.oscStore.port,
        route: '/avatar/parameters/',
        keywords: [],
        assigns: [],
        behavior: 'Constant',
      }

      this.trigger_phrase = ''
      
      this.new_assign = {
        keyword: '',
        type: 'bool',
        set: 'true',
      }

      // Open the dialog.
      this.param_dialog = true
    },
    openEditDialog(i: number) {
      this.openAddParamDialog()

      this.editing = true
      this.editing_index = i

      const existingParam = this.oscStore.osc_profiles[this.oscStore.current_profile][i]
      this.new_param = JSON.parse(JSON.stringify(existingParam)) // Deep copy.
    },
    closeDialog()
    {
      this.editing = false
      this.param_dialog = false
    },
    validate_assign_value_field() {
      const assign = this.new_assign

      switch (assign.type) {
        case 'int':
          if (assign.set === "" || isNaN(Number(assign.set))) // Invalid input.
            assign.set = "0"
          else { // Valid input.
            // Display.
            assign.set = String(parseInt(assign.set))
          }

          break
        case 'float':
          if (assign.set === "" || isNaN(Number(assign.set))) // Invalid input.
            assign.set = "0"
          else { // Valid input.
            // Display.
            assign.set = assign.set.replace(/^0+(?=\d)/, '') // Remove leading zeros in front of the number.
          }

          break
        case 'bool':
          if (assign.set !== "true" && assign.set !== "false") // Invalid input.
            assign.set = "true"

          break
      }
    },
    add_trigger() {
      if (!this.trigger_phrase.trim()) // The trigger phrase field is empty.
        return

      this.new_param.keywords.push({ enabled: true, text: this.trigger_phrase })

      this.trigger_phrase = ''
    },
    remove_trigger(i: number) {
      this.new_param.keywords.splice(i, 1)
    },
    add_assign() {
      const assign = this.new_assign

      // Validation.
      if (!assign.keyword.trim()) // The assign keyword field is empty.
        return

      // Display.
      if (assign.type === "float") {
        if (!assign.set.includes('.')) { // 123 → 123.0
          assign.set = assign.set + ".0"
        }
        else if (assign.set.endsWith('.')) { // 123. → 123.0
          assign.set = assign.set + "0"
        }
      }

      // Store.
      this.new_param.assigns.push(assign)

      // Partially reset the assign fields.
      this.new_assign = {
        keyword: '',
        type: assign.type,
        set: assign.set,
      }
    },
    remove_assign(i: number) {
      this.new_param.assigns.splice(i, 1)
    },
    confirm_param() {
      if (!this.editing) {
        this.oscStore.osc_profiles[this.oscStore.current_profile].push(this.new_param)
      }
      else {
        this.oscStore.osc_profiles[this.oscStore.current_profile][this.editing_index] = JSON.parse(JSON.stringify(this.new_param)) // Deep copy.

        this.editing = false
      }

      this.param_dialog = false
    },
    delete_param(i: number) {
      this.oscStore.osc_profiles[this.oscStore.current_profile].splice(i, 1)
    },
    delete_profile(profile_name: string) {
      this.oscStore.current_profile = "Default"
      this.profile_delete_target = profile_name

      this.profile_delete_dialog = true
    },
    delete_profile_final()
    {
      delete this.oscStore.osc_profiles[this.profile_delete_target]

      this.profile_delete_dialog = false
    }
  },
}
</script>
