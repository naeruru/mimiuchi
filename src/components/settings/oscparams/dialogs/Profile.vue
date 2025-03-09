<template>
  <v-dialog v-model="model" width="50vw" max-width="512px">
    <v-card v-click-outside="closeDialog">
      <v-card-title v-if="mode === 'add'">
        {{ t('settings.osc.params.profile.dialog.title.add') }}
      </v-card-title>
      <v-card-title v-if="mode === 'edit'">
        {{ t('settings.osc.params.profile.dialog.title.edit') }}
      </v-card-title>

      <v-divider class="mx-4" />

      <v-card-text>
        <v-row>
          <v-col :cols="12">
            <v-form
              v-model="new_profile_name_valid"
              @submit.prevent="new_profile_name_valid ? confirmAddProfileDialog() : null"
            >
              <v-text-field
                v-model="new_profile_name"
                :label="t('settings.osc.params.profile.dialog.field_label')"
                :rules="[
                  rules.required,
                  rules.empty,
                  rules.already_taken(new_profile_name, oscStore.osc_profiles),
                ]"
                autofocus
                spellcheck="false"
              />
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="closeDialog">
          {{ t('settings.osc.params.button.cancel') }}
        </v-btn>
        <v-btn
          v-if="mode === 'add'"
          color="primary"
          :disabled="!new_profile_name_valid"
          @click="confirmAddProfileDialog"
        >
          {{ t('settings.osc.params.button.add') }}
        </v-btn>
        <v-btn
          v-if="mode === 'edit'"
          color="primary"
          :disabled="!new_profile_name_valid"
          @click="confirmEditProfileDialog"
        >
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

const props = defineProps<{ mode: string, new_name: string }>()
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const model = defineModel<boolean>()

const oscStore = useOSCStore()

const rules = ref({
  required: (value: string) => !!value || 'Required',
  empty: (value: string) => !!value.trim() || 'Cannot be empty',
  already_taken: (value: string, collection: object) => !(value in collection) || 'Already in use',
})

const new_profile_name = ref('')
const new_profile_name_valid = ref(false)

const profile_being_edited = ref('')

function closeDialog() {
  emit('update:modelValue', false)
}

function confirmAddProfileDialog() {
  oscStore.osc_profiles[new_profile_name.value] = []
  oscStore.current_profile = new_profile_name.value

  closeDialog()
}

function confirmEditProfileDialog() {
  oscStore.osc_profiles[new_profile_name.value] = oscStore.osc_profiles[profile_being_edited.value]

  if (oscStore.current_profile === profile_being_edited.value)
    oscStore.current_profile = new_profile_name.value

  delete oscStore.osc_profiles[profile_being_edited.value]

  closeDialog()
}

watch(model, (enabled) => {
  if (enabled) {
    new_profile_name.value = props.new_name

    if (props.mode === 'edit')
      profile_being_edited.value = props.new_name
  }
})
</script>
