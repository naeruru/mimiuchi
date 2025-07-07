<template>
  <v-dialog v-model="model" width="50vw" max-width="512px" persistent>
    <v-card>
      <v-card-title v-if="mode === 'add'">
        {{ t('settings.osc.triggers.trigger.dialog_title.add') }}
      </v-card-title>
      <v-card-title v-if="mode === 'edit'">
        {{ t('settings.osc.triggers.trigger.dialog_title.edit') }}
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col :cols="12" :lg="8" :sm="8">
            <v-text-field
              v-model="new_trigger.ip"
              label="OSC IP"
              hide-details
            />
          </v-col>
          <v-col :cols="12" :lg="4" :sm="4">
            <v-number-input
              v-model="new_trigger.port"
              control-variant="stacked"
              hide-details
              label="OSC port"
              :min="1"
              :max="65535"
            />
          </v-col>
          <v-col :cols="12">
            <v-text-field
              v-model="new_trigger.route"
              :label="t('settings.osc.triggers.trigger.address')"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider class="mx-4" />

      <v-card-text class="mt-2">
        <v-row>
          <v-col>
            <strong>{{ t('settings.osc.triggers.trigger.trigger_phrases') }}</strong>
            <v-chip v-if="!new_trigger.keywords.length" variant="text">
              {{ t('settings.osc.triggers.trigger.empty') }}
            </v-chip>
            <v-chip
              v-for="(keyword, i) in new_trigger.keywords"
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
              :label="t('settings.osc.triggers.trigger.trigger_phrases_add')"
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
            <strong>{{ t('settings.osc.triggers.trigger.assign.phrases') }}</strong>
            <v-chip v-if="!new_trigger.assigns.length" variant="text">
              {{ t('settings.osc.triggers.trigger.empty') }}
            </v-chip>
            <v-list v-if="new_trigger.assigns.length" density="compact">
              <v-list-item
                v-for="(assign, i) in new_trigger.assigns"
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
              :label="t('settings.osc.triggers.trigger.assign.phrases_type')"
              @update:model-value="validate_assign_values"
            />
          </v-col>
          <v-col :cols="12" :lg="6" :sm="6">
            <v-select
              v-model="new_assign.behavior"
              :items="[
                { name: t('settings.osc.triggers.trigger.assign.behavior_options.default'), value: 'default' },
                { name: t('settings.osc.triggers.trigger.assign.behavior_options.pulse'), value: 'pulse' },
              ]"
              item-title="name"
              item-value="value"
              hide-details
              :label="t('settings.osc.triggers.trigger.assign.behavior')"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            :cols="12"
            :lg="!(new_assign.behavior === 'pulse') ? 12 : 4"
            :md="!(new_assign.behavior === 'pulse') ? 12 : 4"
          >
            <v-select
              v-if="new_assign.type === 'bool'"
              v-model="new_assign.set1"
              :items="['true', 'false']"
              hide-details
              :label="`${t('settings.osc.triggers.trigger.assign.phrases_value')}1`"
            />
            <v-number-input
              v-if="(new_assign.type === 'int')"
              v-model="new_assign.set1"
              control-variant="stacked"
              hide-details
              :label="`${t('settings.osc.triggers.trigger.assign.phrases_value')}1`"
              :step="1"
            />
            <v-number-input
              v-if="(new_assign.type === 'float')"
              v-model="new_assign.set1"
              control-variant="stacked"
              hide-details
              :label="`${t('settings.osc.triggers.trigger.assign.phrases_value')}1`"
              :max="+1"
              :min="-1"
              :precision="3"
              :step="0.01"
            />
          </v-col>
          <v-col
            v-if="new_assign.behavior === 'pulse'"
            :cols="12"
            :lg="4"
            :md="4">
            <v-number-input
              v-model="new_assign.pulse_duration"
              control-variant="stacked"
              hide-details
              :label="t('settings.osc.triggers.trigger.assign.behavior_options.pulse_wait')"
              suffix="ms"
            />
          </v-col>
          <v-col
            v-if="new_assign.behavior === 'pulse'"
            :cols="12"
            :lg="4"
            :md="4">
            <v-select
              v-if="new_assign.type === 'bool'"
              v-model="new_assign.set2"
              :items="['true', 'false']"
              hide-details
              :label="`${t('settings.osc.triggers.trigger.assign.phrases_value')}2`"
            />
            <v-number-input
              v-if="(new_assign.type === 'int')"
              v-model="new_assign.set2"
              control-variant="stacked"
              hide-details
              :label="`${t('settings.osc.triggers.trigger.assign.phrases_value')}2`"
              :step="1"
            />
            <v-number-input
              v-if="(new_assign.type === 'float')"
              v-model="new_assign.set2"
              control-variant="stacked"
              hide-details
              :label="`${t('settings.osc.triggers.trigger.assign.phrases_value')}2`"
              :max="+1"
              :min="-1"
              :precision="3"
              :step="0.01"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col :cols="12">
            <v-text-field
              v-model="new_assign.keyword"
              :label="t('settings.osc.triggers.trigger.assign.phrases_add')"
              hide-details
              append-icon="mdi-plus"
              @click:append="addAssign"
              @keydown.enter="addAssign"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <div v-if="new_trigger.keywords.length && new_trigger.assigns.length" class="ma-2">
        <v-list-item
          :title="`Example phrase: 'set ${new_trigger.keywords[0]?.text} to ${new_trigger.assigns[0]?.keyword}'`"
          :subtitle="`${new_trigger.route} -> ${new_trigger.assigns[0]?.set1}`"
        />
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="closeDialog">
          {{ t('settings.osc.triggers.button.cancel') }}
        </v-btn>
        <v-btn v-if="mode === 'add'" color="primary" @click="confirmAddTrigger">
          {{ t('settings.osc.triggers.button.add') }}
        </v-btn>
        <v-btn v-if="mode === 'edit'" color="primary" @click="confirmEditTrigger">
          {{ t('settings.osc.triggers.button.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Assign, useOSCStore } from '@/stores/osc'

const props = defineProps<{
  mode: string,
  editingIndex: number,
}>()

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

interface Keyword {
  enabled: boolean
  text: string
}

const model = defineModel<boolean>()

const oscStore = useOSCStore()

const trigger_phrase = ref('')

const value_types = ref(['bool', 'int', 'float'])

const new_assign = ref<Assign>({
  keyword: '',
  type: 'bool',
  set1: 'true',
  set2: 'false',

  // "default": send a value
  // "pulse": send a value, wait some time, then send a value
  behavior: 'default',
  pulse_duration: 0,
})

const new_trigger = ref({
  // name: '',
  ip: '',
  port: NaN,
  route: '/avatar/parameters/',
  keywords: [] as Keyword[], // [{enabled: boolean, text: string}?],
  assigns: [] as Assign[], // [{keyword: string, type: string, set: string}?]
})

watch(model, (enabled) => {
  if (enabled) {
    // Reset the dialog's fields.
    new_trigger.value = {
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
      behavior: 'default',
      pulse_duration: 1000,
    }

    if (props.mode === 'edit') {
      const existingTrigger = oscStore.osc_profiles[oscStore.current_profile][props.editingIndex as number]
      new_trigger.value = JSON.parse(JSON.stringify(existingTrigger)) // Deep copy
    }
  }
})

function closeDialog() {
  emit('update:modelValue', false)
}

function confirmAddTrigger() {
  oscStore.osc_profiles[oscStore.current_profile].push(new_trigger.value)

  closeDialog()
}

function confirmEditTrigger() {
  oscStore.osc_profiles[oscStore.current_profile][props.editingIndex as number] = JSON.parse(JSON.stringify(new_trigger.value)) // Deep copy

  closeDialog()
}

function addTrigger() {
  if (!trigger_phrase.value.trim()) // The trigger phrase field is empty
    return

  new_trigger.value.keywords.push({ enabled: true, text: trigger_phrase.value })

  trigger_phrase.value = ''
}

function deleteTrigger(i: number) {
  new_trigger.value.keywords.splice(i, 1)
}

function validate_assign_values() {
  if (new_assign.value.type === 'bool') {
      new_assign.value.set1 = 'true'
      new_assign.value.set2 = 'false'
  }
}

function addAssign() {
  const assign = new_assign

  // Validation
  if (!assign.value.keyword.trim()) // The assign keyword field is empty
    return

  // Store
  new_trigger.value.assigns.push(assign.value)

  // Partially reset the assign fields
  new_assign.value = {
    keyword: '',
    type: assign.value.type,
    set1: assign.value.set1,
    set2: 'false',
    behavior: 'default',
    pulse_duration: 1000,
  }
}

function deleteAssign(i: number) {
  new_trigger.value.assigns.splice(i, 1)
}

function displayAssignSubtitle(assign_object: any) {
  let subtitle = `set ${assign_object.type} to ${assign_object.set1}`

  if (assign_object.behavior === 'pulse')
    subtitle = `${subtitle} → wait ${assign_object.pulse_duration}ms → set ${assign_object.type} to ${assign_object.set2}`

  return subtitle
}
</script>
