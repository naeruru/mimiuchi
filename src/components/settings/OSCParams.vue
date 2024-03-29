<template>
  <v-card color="transparent" flat class="pb-16">
    <template v-slot:title>
      <span v-html="$t('settings.osc.params.title')"></span>
      <v-chip prepend-icon="mdi-alert-circle-outline" color="warning" class="ml-2" variant="elevated" size="small">
        Subject to change
      </v-chip>
    </template>
    <template v-slot:subtitle>
      <span v-html="$t('settings.osc.params.description')"></span>
    </template>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col :cols="10" class="d-flex align-center">
          <v-select
            v-model="oscStore.current_profile"
            :label="$t('settings.osc.params.profile.label')"
            :items="sorted_profiles"
            variant="outlined"
            :menu-props="{ closeOnContentClick: true }"
          >
            <template v-slot:item="{ item }">
              <v-list-item @click="oscStore.current_profile = item.title">
                <div class="d-flex align-center">
                  <v-list-item-title class="flex-grow-1">
                    {{ item.title }}
                  </v-list-item-title>
                  <v-list-item-action>
                    <v-btn icon variant="plain" density="comfortable" @click.stop="openRenameProfileDialog(item.title)">
                      <v-icon v-if="item.title !== 'Default'">mdi-pencil-outline</v-icon>
                    </v-btn>
                  </v-list-item-action>
                  <v-list-item-action class="ml-2">
                    <v-btn icon variant="plain" density="comfortable" @click.stop="delete_profile(item.title)">
                      <v-icon v-if="item.title !== 'Default'">mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </div>
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
            <v-btn class="ml-4" flat variant="text" size="small" color="primary" append-icon="mdi-pencil" @click="openEditParamDialog(i)">
              {{ $t('settings.osc.params.param.button.edit') }}
            </v-btn>
            <v-btn class="ml-4" flat variant="text" size="small" color="error" append-icon="mdi-delete" @click="delete_param(i)">
              {{ $t('settings.osc.params.param.button.delete') }}
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-row>
              <!-- <v-col :cols="12">
                                <v-text-field v-model="param.name" label="Name" hide-details></v-text-field>
                            </v-col> -->
              <v-col :cols="12" :md="6">
                <v-text-field v-model="param.ip" :label="$t('settings.osc.general.osc_ip')" variant="outlined" hide-details readonly />
              </v-col>
              <v-col>
                <v-text-field v-model="param.port" :label="$t('settings.osc.general.osc_port')" variant="outlined" hide-details readonly />
              </v-col>

              <v-col :cols="12">
                <strong v-html="$t('settings.osc.params.param.trigger_phrases')"></strong>
              </v-col>
              <v-col :cols="12">
                <v-chip v-for="(keyword, i) in param.keywords" v-model="keyword.enabled" class="mx-1 mb-2" label color="secondary" size="small">
                  {{ keyword.text }}
                </v-chip>
              </v-col>
              <v-col :cols="12">
                <strong v-html="$t('settings.osc.params.param.assign_phrases')"></strong>
                <v-list density="compact">
                  <v-list-item
                    v-for="(assign, i) in param.assigns"
                    :value="assign"
                    :title="assign.keyword"
                    :subtitle="`set ${assign.type} to ${assign.set}`"
                    class="display-only"
                  />
                </v-list>
              </v-col>
              <v-col :cols="12">
                <strong v-html="$t('settings.osc.params.param.behavior')"></strong>
                <v-list density="compact">
                  <v-list-item
                    :value="param"
                    :title="`${$t('settings.osc.params.param.activation_signal_options.' + param.activation_signal)}${param.activation_signal === 'pulse' ? ` (${param.pulse_delay}ms)` : ''}`"
                    class="display-only"
                  />
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card>
      <p v-else v-html="$t('settings.osc.params.empty')"></p>
      <v-card class="mt-2" color="transparent" flat>
        <v-card-actions>
          <v-btn color="primary" variant="outlined" size="small" icon="mdi-plus" @click="openAddParamDialog" />
        </v-card-actions>
      </v-card>
    </v-card-text>
    <!-- Profile Dialog -->
    <v-row justify="center">
      <v-dialog v-model="profile_dialog" width="50vw">
        <v-card v-click-outside="closeProfileDialog">
          <v-card-title v-if="!profile_editing">{{ $t('settings.osc.params.profile.dialog.title.add') }}</v-card-title>
          <v-card-title v-else>{{ $t('settings.osc.params.profile.dialog.title.edit') }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col :cols="12">
                <v-text-field v-model="new_profile_name" :label="$t('settings.osc.params.profile.dialog.field_label')" hide-details />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn @click="closeProfileDialog">
              {{ $t('settings.osc.params.button.cancel') }}
            </v-btn>
            <v-btn v-if="!profile_editing" color="primary" @click="confirmNewProfile">
              {{ $t('settings.osc.params.button.add') }}
            </v-btn>
            <v-btn v-else color="primary" @click="confirmNewProfile">
              {{ $t('settings.osc.params.button.confirm') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- Profile Delete Dialog -->
    <v-row justify="center">
      <v-dialog v-model="profile_delete_dialog" width="50vw">
        <v-card>
          <v-card-title>{{ $t('settings.osc.params.profile.delete_dialog.title') }}</v-card-title>
          <v-card-text>{{ `${profile_delete_target}` }}</v-card-text>
          <v-card-text>{{ $t('settings.osc.params.profile.delete_dialog.text') }}</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="profile_delete_dialog = false">
              {{ $t('settings.osc.params.button.cancel') }}
            </v-btn>
            <v-btn color="primary" @click="delete_profile_final()">
              {{ $t('settings.osc.params.button.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- Param Trigger Dialog -->
    <v-row justify="center">
      <v-dialog v-model="param_dialog" width="50vw" persistent>
        <v-card>
          <v-card-title v-if="!param_editing">{{ $t('settings.osc.params.param.dialog_title.add') }}</v-card-title>
          <v-card-title v-else>{{ $t('settings.osc.params.param.dialog_title.edit') }}</v-card-title>
          <v-card-text>
            <v-row>
              <!-- <v-col :cols="12">
                                <v-text-field v-model="new_param.name" label="Name" hide-details></v-text-field>
                            </v-col> -->
              <v-col :cols="12">
                <v-text-field v-model="new_param.route" :label="$t('settings.osc.params.param.address')" hide-details />
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
                <strong v-html="$t('settings.osc.params.param.trigger_phrases')"></strong>
                <v-chip v-if="!new_param.keywords.length" variant="text">
                  {{ $t('settings.osc.params.param.empty') }}
                </v-chip>
                <v-chip
                  v-else v-model="keyword.enabled"
                  v-for="(keyword, i) in new_param.keywords"
                  class="mx-1 mb-2"
                  label
                  color="secondary"
                  size="small"
                  closable
                  @click:close="remove_trigger(i)"
                >
                  {{ keyword.text }}
                </v-chip>
              </v-col>
              <v-col :cols="12">
                <v-text-field
                  v-model="trigger_phrase"
                  :label="$t('settings.osc.params.param.trigger_phrases_add')"
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
                <strong v-html="$t('settings.osc.params.param.assign_phrases')"></strong>
                <v-chip v-if="!new_param.assigns.length" variant="text">
                  {{ $t('settings.osc.params.param.empty') }}
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
                <v-select
                  v-model="new_assign.type"
                  :items="var_types"
                  hide-details
                  :label="$t('settings.osc.params.param.assign_phrases_type')"
                  @update:modelValue="validate_assign_value_field"
                />
              </v-col>
              <v-col :cols="12" :lg="8">
                <v-text-field
                  v-if="new_assign.type !== 'bool'"
                  v-model="new_assign.set"
                  hide-details
                  :label="$t('settings.osc.params.param.assign_phrases_value')"
                  type="number"
                  @input="validate_assign_value_field"
                />
                <v-select
                  v-else
                  v-model="new_assign.set"
                  :items="['true', 'false']"
                  hide-details
                  :label="$t('settings.osc.params.param.assign_phrases_value')"
                />
              </v-col>
              <v-col :cols="12">
                <v-text-field
                  v-model="new_assign.keyword"
                  :label="$t('settings.osc.params.param.assign_phrases_add')"
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
                <strong v-html="$t('settings.osc.params.param.behavior')"></strong>
              </v-col>
              <v-col :cols="6">
                <v-select
                  v-model="new_param.activation_signal"
                  :items="[
                    { name: $t('settings.osc.params.param.activation_signal_options.constant'), value: 'constant' },
                    { name: $t('settings.osc.params.param.activation_signal_options.pulse'), value: 'pulse' }
                  ]"
                  item-title="name"
                  item-value="value"
                  hide-details
                  :label="$t('settings.osc.params.param.activation_signal')"
                />
              </v-col>
              <v-col :cols="6">
                <v-text-field
                  v-if="new_param.activation_signal === 'pulse'"
                  v-model="new_param.pulse_delay"
                  hide-details
                  :label="$t('settings.osc.params.param.activation_signal_options.pulse_duration')"
                  type="number"
                  @input="new_param.pulse_delay = Math.round(new_param.pulse_delay)"
                />
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
            <v-btn @click="closeParamDialog">
              {{ $t('settings.osc.params.button.cancel') }}
            </v-btn>
            <v-btn color="primary" @click="confirm_param">
              {{ $t('settings.osc.params.button.confirm') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-card>
</template>

<style>
.display-only {
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

    profile_editing: false,
    profile_editing_key: '',

    profile_delete_dialog: false,
    profile_delete_target: '',

    param_dialog: false,

    param_editing: false,
    param_editing_index: 0,

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

      // "constant" (Default): set the parameter to this value.
      // "pulse": set the parameter to this value, then reset it (0, 0.0, false) after some time.
      activation_signal: 'constant',
      pulse_delay: 0,
    },
  }),
  computed: {
    sorted_profiles() {
      return Object.keys(this.oscStore.osc_profiles).sort((a, b) => {
        if (a === "Default")
          return -1 // The profile "Default" is always first.
        else if (b === "Default")
          return 1 
        else
          return a.localeCompare(b)
      })
    },
  },
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

      if (this.profile_editing) {
        this.oscStore.osc_profiles[this.new_profile_name] = this.oscStore.osc_profiles[this.profile_editing_key]

        if (this.oscStore.current_profile === this.profile_editing_key)
          this.oscStore.current_profile = this.new_profile_name

        delete this.oscStore.osc_profiles[this.profile_editing_key]

        this.profile_editing = false
      }
      else {
        this.oscStore.osc_profiles[this.new_profile_name] = []
        this.oscStore.current_profile = this.new_profile_name
      }

      // Reset the dialog's field.
      this.new_profile_name = ''

      this.profile_dialog = false
    },
    openRenameProfileDialog(profile_name: string) {
      this.profile_editing = true
      this.profile_editing_key = profile_name
      this.new_profile_name = profile_name

      this.profile_dialog = true
    },
    closeProfileDialog()
    {
      this.profile_editing = false
      this.profile_dialog = false
    },
    delete_profile(profile_name: string) {
      this.profile_delete_target = profile_name

      this.profile_delete_dialog = true
    },
    delete_profile_final()
    {
      if (this.oscStore.current_profile === this.profile_delete_target)
        this.oscStore.current_profile = "Default"

      delete this.oscStore.osc_profiles[this.profile_delete_target]

      this.profile_delete_dialog = false
    },
    openAddParamDialog() {
      // Reset the dialog's fields.
      this.new_param = {
        ip: this.oscStore.ip,
        port: this.oscStore.port,
        route: '/avatar/parameters/',
        keywords: [],
        assigns: [],
        activation_signal: 'constant',
        pulse_delay: 1000,
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
    openEditParamDialog(i: number) {
      this.openAddParamDialog()

      this.param_editing = true
      this.param_editing_index = i

      const existingParam = this.oscStore.osc_profiles[this.oscStore.current_profile][i]
      this.new_param = JSON.parse(JSON.stringify(existingParam)) // Deep copy.
    },
    closeParamDialog()
    {
      this.param_editing = false
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
      if (!this.param_editing) {
        this.oscStore.osc_profiles[this.oscStore.current_profile].push(this.new_param)
      }
      else {
        this.oscStore.osc_profiles[this.oscStore.current_profile][this.param_editing_index] = JSON.parse(JSON.stringify(this.new_param)) // Deep copy.

        this.param_editing = false
      }

      this.param_dialog = false
    },
    delete_param(i: number) {
      this.oscStore.osc_profiles[this.oscStore.current_profile].splice(i, 1)
    },
  },
}
</script>
