<template>
  <v-dialog v-model="model" width="50vw" max-width="512px" persistent>
    <v-card>
      <v-card-title v-if="mode === 'add'">
        {{ t('settings.osc.params.param.dialog_title.add') }}
      </v-card-title>
      <v-card-title v-if="mode === 'edit'">
        {{ t('settings.osc.params.param.dialog_title.edit') }}
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col :cols="12">
            <v-text-field v-model="new_param.route" :label="t('settings.osc.params.param.address')" hide-details />
          </v-col>
          <v-col :cols="12" :lg="8" :sm="8">
            <v-text-field v-model="new_param.ip" label="OSC IP" hide-details />
          </v-col>
          <v-col :cols="12" :lg="4" :sm="4">
            <v-text-field v-model="new_param.port" label="OSC port" hide-details />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider class="mx-4" />

      <v-card-text class="mt-2">
        <v-row>
          <v-col>
            <strong>{{ t('settings.osc.params.param.trigger_phrases') }}</strong>
            <v-chip v-if="!new_param.keywords.length" variant="text">
              {{ t('settings.osc.params.param.empty') }}
            </v-chip>
            <v-chip
              v-for="(keyword, i) in new_param.keywords"
              v-else
              v-model="keyword.enabled"
              class="mx-1 mb-2"
              closable
              color="secondary"
              label
              size="small"
              @click:close="deleteTrigger(i)"
            >
              {{ keyword.text }}
            </v-chip>
          </v-col>
          <v-col :cols="12">
            <v-text-field
              v-model="trigger_phrase"
              :label="t('settings.osc.params.param.trigger_phrases_add')"
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
            <strong>{{ t('settings.osc.params.param.assign.phrases') }}</strong>
            <v-chip v-if="!new_param.assigns.length" variant="text">
              {{ t('settings.osc.params.param.empty') }}
            </v-chip>
            <v-list v-if="new_param.assigns.length" density="compact">
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
          <v-col :cols="12" :lg="6" :sm="6">
            <v-select
              v-model="new_assign.type"
              :items="value_types"
              hide-details
              :label="t('settings.osc.params.param.assign.phrases_type')"
              @update:model-value="validateAssignValueAll"
            />
          </v-col>
          <v-col :cols="12" :lg="6" :sm="6">
            <v-select
              v-model="new_assign.activation"
              :items="[
                { name: t('settings.osc.params.param.assign.behavior_options.default'), value: 'default' },
                { name: t('settings.osc.params.param.assign.behavior_options.pulse'), value: 'pulse' },
              ]"
              item-title="name"
              item-value="value"
              hide-details
              :label="t('settings.osc.params.param.assign.behavior')"
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
              :label="t('settings.osc.params.param.assign.phrases_value')"
              type="number"
              @input="validateAssignValue1"
            />
            <v-select
              v-else
              v-model="new_assign.set1"
              :items="['true', 'false']"
              hide-details
              :label="t('settings.osc.params.param.assign.phrases_value')"
            />
          </v-col>
        </v-row>

        <!-- This row is displayed if the assign activation is "pulse". -->
        <v-row v-if="new_assign.activation === 'pulse'">
          <v-col :cols="12" :lg="4" :md="4">
            <v-text-field
              v-if="new_assign.type !== 'bool'"
              v-model="new_assign.set1"
              hide-details
              :label="`${t('settings.osc.params.param.assign.phrases_value')}1`"
              type="number"
              @input="validateAssignValue1"
            />
            <v-select
              v-else
              v-model="new_assign.set1"
              :items="['true', 'false']"
              hide-details
              :label="`${t('settings.osc.params.param.assign.phrases_value')}1`"
            />
          </v-col>

          <v-col :cols="12" :lg="4" :md="4">
            <v-text-field
              v-model="new_assign.pulse_duration"
              hide-details
              :label="t('settings.osc.params.param.assign.behavior_options.pulse_wait')"
              type="number"
              suffix="ms"
              @input="new_assign.pulse_duration = Math.round(new_assign.pulse_duration)"
            />
          </v-col>

          <v-col :cols="12" :lg="4" :md="4">
            <v-text-field
              v-if="new_assign.type !== 'bool'"
              v-model="new_assign.set2"
              hide-details
              :label="`${t('settings.osc.params.param.assign.phrases_value')}2`"
              type="number"
              @input="validateAssignValue2"
            />
            <v-select
              v-else
              v-model="new_assign.set2"
              :items="['true', 'false']"
              hide-details
              :label="`${t('settings.osc.params.param.assign.phrases_value')}2`"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col :cols="12">
            <v-text-field
              v-model="new_assign.keyword"
              :label="t('settings.osc.params.param.assign.phrases_add')"
              hide-details
              append-icon="mdi-plus"
              @click:append="addAssign"
              @keydown.enter="addAssign"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <div v-if="new_param.keywords.length && new_param.assigns.length" class="ma-2">
        <v-list-item
          :title="`Example phrase: 'set ${new_param.keywords[0]?.text} to ${new_param.assigns[0]?.keyword}'`"
          :subtitle="`${new_param.route} -> ${new_param.assigns[0]?.set1}`"
        />
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="closeDialog">
          {{ t('settings.osc.params.button.cancel') }}
        </v-btn>
        <v-btn v-if="mode === 'add'" color="primary" @click="confirmAddParam">
          {{ t('settings.osc.params.button.add') }}
        </v-btn>
        <v-btn v-if="mode === 'edit'" color="primary" @click="confirmEditParam">
          {{ t('settings.osc.params.button.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useOSCStore } from '@/stores/osc'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ mode: string, editingIndex: number }>()
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
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

const model = defineModel<boolean>()

const oscStore = useOSCStore()

const trigger_phrase = ref('')

const value_types = ref(['bool', 'int', 'float'])

const new_assign = ref({
  keyword: '',
  type: 'bool',
  set1: 'true',
  set2: 'false',

  // "default": set the parameter to a value.
  // "pulse": set the parameter to a value, wait some time, then set the parameter to another value.
  activation: 'default',
  pulse_duration: 0,
})

const new_param = ref({
  // name: '',
  ip: '',
  port: '',
  route: '/avatar/parameters/',
  keywords: [] as Keyword[], // [{enabled: boolean, text: string}?],
  assigns: [] as Assign[], // [{keyword: string, type: string, set: string}?]
})

watch(model, (enabled) => {
  if (enabled) {
    // Reset the dialog's fields.
    new_param.value = {
      ip: oscStore.ip,
      port: oscStore.port,
      route: '/avatar/parameters/',
      keywords: [],
      assigns: [],
    }

    trigger_phrase.value = ''

    new_assign.value = {
      keyword: '',
      type: 'bool',
      set1: 'true',
      set2: 'false',
      activation: 'default',
      pulse_duration: 1000,
    }

    if (props.mode === 'edit') {
      const existingParam = oscStore.osc_profiles[oscStore.current_profile][props.editingIndex as number]
      new_param.value = JSON.parse(JSON.stringify(existingParam)) // Deep copy
    }
  }
})

function closeDialog() {
  emit('update:modelValue', false)
}

function confirmAddParam() {
  oscStore.osc_profiles[oscStore.current_profile].push(new_param.value)

  closeDialog()
}

function confirmEditParam() {
  oscStore.osc_profiles[oscStore.current_profile][props.editingIndex as number] = JSON.parse(JSON.stringify(new_param.value)) // Deep copy

  closeDialog()
}

function addTrigger() {
  if (!trigger_phrase.value.trim()) // The trigger phrase field is empty
    return

  new_param.value.keywords.push({ enabled: true, text: trigger_phrase.value })

  trigger_phrase.value = ''
}

function deleteTrigger(i: number) {
  new_param.value.keywords.splice(i, 1)
}

function validateAssignValue1() {
  const assign = new_assign

  switch (assign.value.type) {
    case 'int':
      if (assign.value.set1 === '' || Number.isNaN(Number(assign.value.set1))) { // Invalid input
        assign.value.set1 = '0'
      }
      else { // Valid input.
        // Display.
        assign.value.set1 = String(Number.parseInt(assign.value.set1))
      }

      break
    case 'float':
      if (assign.value.set1 === '' || Number.isNaN(Number(assign.value.set1))) { // Invalid input
        assign.value.set1 = '0'
      }
      else { // Valid input.
        // Display.
        assign.value.set1 = assign.value.set1.replace(/^0+(?=\d)/, '') // Remove leading zeros in front of the number
      }

      break
    case 'bool':
      if (assign.value.set1 !== 'true' && assign.value.set1 !== 'false') // Invalid input
        assign.value.set1 = 'true'

      break
  }
}

function validateAssignValue2() {
  const assign = new_assign

  switch (assign.value.type) {
    case 'int':
      if (assign.value.set2 === '' || Number.isNaN(Number(assign.value.set2))) { // Invalid input
        assign.value.set2 = '0'
      }
      else { // Valid input.
        // Display.
        assign.value.set2 = String(Number.parseInt(assign.value.set2))
      }

      break
    case 'float':
      if (assign.value.set2 === '' || Number.isNaN(Number(assign.value.set2))) { // Invalid input
        assign.value.set2 = '0'
      }
      else { // Valid input.
        // Display.
        assign.value.set2 = assign.value.set2.replace(/^0+(?=\d)/, '') // Remove leading zeros in front of the number
      }

      break
    case 'bool':
      if (assign.value.set2 !== 'true' && assign.value.set2 !== 'false') // Invalid input
        assign.value.set2 = 'true'

      break
  }
}

function validateAssignValueAll() {
  validateAssignValue1()

  if (new_assign.value.activation === 'pulse')
    validateAssignValue2()
}

function addAssign() {
  const assign = new_assign

  // Validation.
  if (!assign.value.keyword.trim()) // The assign keyword field is empty
    return

  // Display.
  if (assign.value.type === 'float') {
    if (!assign.value.set1.includes('.')) { // 123 → 123.0
      assign.value.set1 = `${assign.value.set1}.0`
    }
    else if (assign.value.set1.endsWith('.')) { // 123. → 123.0
      assign.value.set1 = `${assign.value.set1}0`
    }
  }

  // Store.
  new_param.value.assigns.push(assign.value)

  // Partially reset the assign fields.
  new_assign.value = {
    keyword: '',
    type: assign.value.type,
    set1: assign.value.set1,
    set2: 'false',
    activation: 'default',
    pulse_duration: 1000,
  }
}

function deleteAssign(i: number) {
  new_param.value.assigns.splice(i, 1)
}

function displayAssignSubtitle(assign_object: any) {
  let subtitle = `set ${assign_object.type} to ${assign_object.set1}`

  if (assign_object.activation === 'pulse')
    subtitle = `${subtitle}, wait ${assign_object.pulse_duration}ms, set ${assign_object.type} to ${assign_object.set2}`

  return subtitle
}
</script>
