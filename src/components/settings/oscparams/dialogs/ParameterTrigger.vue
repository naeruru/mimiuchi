<template>
  <v-dialog v-model="dialog" width="50vw" persistent>
    <v-card>
      <v-card-title v-if="mode === 'add'">
        {{ $t('settings.osc.params.param.dialog_title.add') }}
      </v-card-title>
      <v-card-title v-if="mode === 'edit'">
        {{ $t('settings.osc.params.param.dialog_title.edit') }}
      </v-card-title>
      <v-card-text>
        <v-row>
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
              @click:close="deleteTrigger(i)"
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
              @click:append="addTrigger"
              @keydown.enter="addTrigger"
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
                @click="deleteAssign(i)"
                class="assignment-editable"
              />
            </v-list>
          </v-col>
          <v-col :cols="12" :lg="4">
            <v-select
              v-model="new_assign.type"
              :items="value_types"
              hide-details
              :label="$t('settings.osc.params.param.assign_phrases_type')"
              @update:modelValue="validateAssignValue"
            />
          </v-col>
          <v-col :cols="12" :lg="8">
            <v-text-field
              v-if="new_assign.type !== 'bool'"
              v-model="new_assign.set"
              hide-details
              :label="$t('settings.osc.params.param.assign_phrases_value')"
              type="number"
              @input="validateAssignValue"
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
              @click:append="addAssign"
              @keydown.enter="addAssign"
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
              suffix="ms"
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
        <v-btn @click="cancelParamDialog">
          {{ $t('settings.osc.params.button.cancel') }}
        </v-btn>
        <v-btn v-if="mode === 'add'" color="primary" @click="confirmAddParam">
          {{ $t('settings.osc.params.button.add') }}
        </v-btn>
        <v-btn v-if="mode === 'edit'" color="primary" @click="confirmEditParam">
          {{ $t('settings.osc.params.button.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { useOSCStore } from '@/stores/osc'

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
  props: {
    modelValue: Boolean,
    mode: String,
    editingIndex: Number,
  },
  emits: ['update:modelValue'],
  setup() {
    const oscStore = useOSCStore()

    return {
      oscStore,
    }
  },
  data: () => ({
    trigger_phrase: '',

    value_types: ['bool', 'int', 'float'],

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
  watch: {
    dialog(enabled) {
      if (enabled) {
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
        
        if (this.mode === 'edit') {
          const existingParam = this.oscStore.osc_profiles[this.oscStore.current_profile][this.editingIndex as number]
          this.new_param = JSON.parse(JSON.stringify(existingParam)) // Deep copy.
        }
      }
    }
  },
  computed: {
    dialog: {
      get() {
        return this.modelValue
      },
      set(modelValue: boolean) {
        this.$emit('update:modelValue', modelValue)
      },
    },
  },
  methods: {
    cancelParamDialog()
    {
      this.$emit('update:modelValue', false) // Close the dialog.
    },
    confirmAddParam() {
      this.oscStore.osc_profiles[this.oscStore.current_profile].push(this.new_param)

      this.$emit('update:modelValue', false)
    },
    confirmEditParam() {    
      this.oscStore.osc_profiles[this.oscStore.current_profile][this.editingIndex as number] = JSON.parse(JSON.stringify(this.new_param)) // Deep copy.

      this.$emit('update:modelValue', false)
    },
    deleteParam(i: number) {
      this.oscStore.osc_profiles[this.oscStore.current_profile].splice(i, 1)
    },
    addTrigger() {
      if (!this.trigger_phrase.trim()) // The trigger phrase field is empty.
        return

      this.new_param.keywords.push({ enabled: true, text: this.trigger_phrase })

      this.trigger_phrase = ''
    },
    deleteTrigger(i: number) {
      this.new_param.keywords.splice(i, 1)
    },
    validateAssignValue() {
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
    addAssign() {
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
    deleteAssign(i: number) {
      this.new_param.assigns.splice(i, 1)
    },
  },
}
</script>
