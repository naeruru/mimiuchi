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
            <strong v-html="$t('settings.osc.params.param.trigger_phrases')" />
            <v-chip v-if="!new_param.keywords.length" variant="text">
              {{ $t('settings.osc.params.param.empty') }}
            </v-chip>
            <v-chip
              v-for="(keyword, i) in new_param.keywords" v-else
              v-model="keyword.enabled"
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
            <strong v-html="$t('settings.osc.params.param.assign.phrases')" />
            <v-chip v-if="!new_param.assigns.length" variant="text">
              {{ $t('settings.osc.params.param.empty') }}
            </v-chip>
            <v-list density="compact">
              <v-list-item
                v-for="(assign, i) in new_param.assigns"
                :value="assign"
                :title="assign.keyword"
                :subtitle="displayAssignSubtitle(assign)"
                class="assignment-editable"
                @click="deleteAssign(i)"
              />
            </v-list>
          </v-col>
          <v-col :cols="12" :lg="6">
            <v-select
              v-model="new_assign.type"
              :items="value_types"
              hide-details
              :label="$t('settings.osc.params.param.assign.phrases_type')"
              @update:model-value="validateAssignValueAll"
            />
          </v-col>
          <v-col :cols="12" :lg="6">
            <v-select
              v-model="new_assign.activation"
              :items="[
                { name: $t('settings.osc.params.param.assign.behavior_options.default'), value: 'default' },
                { name: $t('settings.osc.params.param.assign.behavior_options.pulse'), value: 'pulse' },
              ]"
              item-title="name"
              item-value="value"
              hide-details
              :label="$t('settings.osc.params.param.assign.behavior')"
              @update:model-value="validateAssignValueAll"
            />
          </v-col>
        </v-row>

        <!-- This row is displayed if the assign activation is "default". -->
        <v-row v-if="new_assign.activation === 'default'">
          <v-col :cols="12" :lg="6">
            <v-text-field
              v-if="new_assign.type !== 'bool'"
              v-model="new_assign.set1"
              hide-details
              :label="$t('settings.osc.params.param.assign.phrases_value')"
              type="number"
              @input="validateAssignValue1"
            />
            <v-select
              v-else
              v-model="new_assign.set1"
              :items="['true', 'false']"
              hide-details
              :label="$t('settings.osc.params.param.assign.phrases_value')"
            />
          </v-col>
        </v-row>

        <!-- This row is displayed if the assign activation is "pulse". -->
        <v-row v-if="new_assign.activation === 'pulse'">
          <v-col :cols="12" :lg="4">
            <v-text-field
              v-if="new_assign.type !== 'bool'"
              v-model="new_assign.set1"
              hide-details
              :label="`${$t('settings.osc.params.param.assign.phrases_value')}1`"
              type="number"
              @input="validateAssignValue1"
            />
            <v-select
              v-else
              v-model="new_assign.set1"
              :items="['true', 'false']"
              hide-details
              :label="`${$t('settings.osc.params.param.assign.phrases_value')}1`"
            />
          </v-col>

          <v-col :cols="12" :lg="4">
            <v-text-field
              v-model="new_assign.pulse_duration"
              hide-details
              :label="$t('settings.osc.params.param.assign.behavior_options.pulse_wait')"
              type="number"
              suffix="ms"
              prepend-icon="mdi-arrow-right-bold"
              append-icon="mdi-arrow-right-bold"
              @input="new_assign.pulse_duration = Math.round(new_assign.pulse_duration)"
            />
          </v-col>

          <v-col :cols="12" :lg="4">
            <v-text-field
              v-if="new_assign.type !== 'bool'"
              v-model="new_assign.set2"
              hide-details
              :label="`${$t('settings.osc.params.param.assign.phrases_value')}2`"
              type="number"
              @input="validateAssignValue2"
            />
            <v-select
              v-else
              v-model="new_assign.set2"
              :items="['true', 'false']"
              hide-details
              :label="`${$t('settings.osc.params.param.assign.phrases_value')}2`"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col :cols="12">
            <v-text-field
              v-model="new_assign.keyword"
              :label="$t('settings.osc.params.param.assign.phrases_add')"
              hide-details
              append-icon="mdi-plus"
              @click:append="addAssign"
              @keydown.enter="addAssign"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider class="mt-4" />

      <div v-if="new_param.keywords.length && new_param.assigns.length" class="ma-2">
        <v-list-item
          :title="`Example phrase: 'set ${new_param.keywords[0]?.text} to ${new_param.assigns[0]?.keyword}'`"
          :subtitle="`${new_param.route} -> ${new_param.assigns[0]?.set1}`"
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
  set1: string // Receive user-input as a string. Parse it when finally sending a payload.
  set2: string
  activation: string
  pulse_duration: number
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
      set1: 'true',
      set2: 'false',

      // "default": set the parameter to a value.
      // "pulse": set the parameter to a value, wait some time, then set the parameter to another value.
      activation: 'default',
      pulse_duration: 0,
    },

    new_param: {
      // name: '',
      ip: '',
      port: '',
      route: '/avatar/parameters/',
      keywords: [] as Keyword[], // [{enabled: boolean, text: string}?],
      assigns: [] as Assign[], // [{keyword: string, type: string, set: string}?]
    },
  }),
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
        }

        this.trigger_phrase = ''

        this.new_assign = {
          keyword: '',
          type: 'bool',
          set1: 'true',
          set2: 'false',
          activation: 'default',
          pulse_duration: 1000,
        }

        if (this.mode === 'edit') {
          const existingParam = this.oscStore.osc_profiles[this.oscStore.current_profile][this.editingIndex as number]
          this.new_param = JSON.parse(JSON.stringify(existingParam)) // Deep copy.
        }
      }
    },
  },
  methods: {
    cancelParamDialog() {
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
    validateAssignValue1() {
      const assign = this.new_assign

      switch (assign.type) {
        case 'int':
          if (assign.set1 === '' || isNaN(Number(assign.set1))) // Invalid input.
          { assign.set1 = '0' }
          else { // Valid input.
            // Display.
            assign.set1 = String(Number.parseInt(assign.set1))
          }

          break
        case 'float':
          if (assign.set1 === '' || isNaN(Number(assign.set1))) // Invalid input.
          { assign.set1 = '0' }
          else { // Valid input.
            // Display.
            assign.set1 = assign.set1.replace(/^0+(?=\d)/, '') // Remove leading zeros in front of the number.
          }

          break
        case 'bool':
          if (assign.set1 !== 'true' && assign.set1 !== 'false') // Invalid input.
            assign.set1 = 'true'

          break
      }
    },
    validateAssignValue2() {
      const assign = this.new_assign

      switch (assign.type) {
        case 'int':
          if (assign.set2 === '' || isNaN(Number(assign.set2))) // Invalid input.
          { assign.set2 = '0' }
          else { // Valid input.
            // Display.
            assign.set2 = String(Number.parseInt(assign.set2))
          }

          break
        case 'float':
          if (assign.set2 === '' || isNaN(Number(assign.set2))) // Invalid input.
          { assign.set2 = '0' }
          else { // Valid input.
            // Display.
            assign.set2 = assign.set2.replace(/^0+(?=\d)/, '') // Remove leading zeros in front of the number.
          }

          break
        case 'bool':
          if (assign.set2 !== 'true' && assign.set2 !== 'false') // Invalid input.
            assign.set2 = 'true'

          break
      }
    },
    validateAssignValueAll() {
      this.validateAssignValue1()

      if (this.new_assign.activation === 'pulse')
        this.validateAssignValue2()
    },
    addAssign() {
      const assign = this.new_assign

      // Validation.
      if (!assign.keyword.trim()) // The assign keyword field is empty.
        return

      // Display.
      if (assign.type === 'float') {
        if (!assign.set1.includes('.')) { // 123 → 123.0
          assign.set1 = `${assign.set1}.0`
        }
        else if (assign.set1.endsWith('.')) { // 123. → 123.0
          assign.set1 = `${assign.set1}0`
        }
      }

      // Store.
      this.new_param.assigns.push(assign)

      // Partially reset the assign fields.
      this.new_assign = {
        keyword: '',
        type: assign.type,
        set1: assign.set1,
        set2: 'false',
        activation: 'default',
        pulse_duration: 1000,
      }
    },
    deleteAssign(i: number) {
      this.new_param.assigns.splice(i, 1)
    },
    displayAssignSubtitle(assign_object: any) {
      let subtitle = `set ${assign_object.type} to ${assign_object.set1}`

      if (assign_object.activation === 'pulse')
        subtitle = `${subtitle}, wait ${assign_object.pulse_duration}ms, set ${assign_object.type} to ${assign_object.set2}`

      return subtitle
    },
  },
}
</script>
