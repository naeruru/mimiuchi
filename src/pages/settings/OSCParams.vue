<template>
  <v-card color="transparent" flat class="pb-16">
    <template #title>
      <span v-html="$t('settings.osc.params.title')" />
      <v-chip
        prepend-icon="mdi-alert-circle-outline"
        color="warning" class="ml-2"
        variant="elevated"
        size="small"
      >
        {{ $t('general.subject_to_change') }}
      </v-chip>
    </template>
    <template #subtitle>
      <span v-html="$t('settings.osc.params.description')" />
    </template>

    <v-divider />

    <v-card-text>
      <!-- Profiles -->
      <v-row>
        <v-col :cols="10" class="d-flex align-center">
          <v-select
            v-model="oscStore.current_profile"
            :label="$t('settings.osc.params.profile.label')"
            :items="sortedProfiles"
            variant="outlined"
            :menu-props="{ closeOnContentClick: true }"
          >
            <template #item="{ item }">
              <v-list-item @click="setProfile(item.title)">
                <div class="d-flex align-center">
                  <v-list-item-title class="flex-grow-1">
                    {{ item.title }}
                  </v-list-item-title>
                  <v-list-item-action v-if="item.title !== 'Default'">
                    <v-btn
                      icon
                      variant="plain"
                      density="comfortable"
                      @click.stop="openEditProfileDialog(item.title)"
                    >
                      <v-icon>mdi-pencil-outline</v-icon>
                    </v-btn>
                  </v-list-item-action>
                  <v-list-item-action v-if="item.title !== 'Default'" class="ml-2">
                    <v-btn
                      icon
                      variant="plain"
                      density="comfortable"
                      @click.stop="openDeleteProfileDialog(item.title)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </div>
              </v-list-item>
            </template>
          </v-select>
        </v-col>
        <v-card-actions class="pa-3" style="height: 80px">
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            icon="mdi-plus"
            @click="openAddProfileDialog"
          />
        </v-card-actions>
      </v-row>

      <!-- Parameter Triggers -->
      <v-expansion-panels
        v-if="Object.keys(oscStore.osc_profiles[oscStore.current_profile]).length > 0"
        v-model="param_panels"
        multiple
      >
        <v-expansion-panel
          v-for="(param, i) in oscStore.osc_profiles[oscStore.current_profile]"
          class="mb-4"
        >
          <v-expansion-panel-title ripple class="param d-flex align-center">
            <v-text-field
              v-model="param.route"
              variant="plain"
              flat
              density="compact"
              hide-details
              readonly
              class="param-route w-100"
            />
            <v-spacer />
            <v-btn
              class="ml-4"
              flat
              variant="text"
              size="small"
              color="primary"
              append-icon="mdi-pencil"
              @click.stop="openEditParamDialog(i)"
            >
              {{ $t('settings.osc.params.param.button.edit') }}
            </v-btn>
            <v-btn
              class="ml-4 mr-4"
              flat variant="text"
              size="small"
              color="error"
              append-icon="mdi-delete"
              @click.stop="openDeleteParamDialog(i)"
            >
              {{ $t('settings.osc.params.param.button.delete') }}
            </v-btn>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card flat>
              <v-card-text>
                <v-row>
                  <v-col :cols="12" :md="6">
                    <v-text-field
                      v-model="param.ip"
                      :label="$t('settings.osc.general.osc_ip')"
                      flat
                      variant="solo-filled"
                      hide-details
                      readonly
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="param.port"
                      :label="$t('settings.osc.general.osc_port')"
                      flat
                      variant="solo-filled"
                      hide-details
                      readonly
                    />
                  </v-col>

                  <v-col :cols="12">
                    <strong v-html="$t('settings.osc.params.param.trigger_phrases')" />
                  </v-col>
                  <v-col :cols="12">
                    <v-chip
                      v-for="(keyword) in param.keywords"
                      v-model="keyword.enabled"
                      class="mx-1 mb-2"
                      label
                      color="secondary"
                      size="small"
                    >
                      {{ keyword.text }}
                    </v-chip>
                  </v-col>
                  <v-col :cols="12">
                    <strong v-html="$t('settings.osc.params.param.assign.phrases')" />
                    <v-list density="compact">
                      <v-list-item
                        v-for="(assign) in param.assigns"
                        :value="assign"
                        :title="assign.keyword"
                        :subtitle="displayAssignSubtitle(assign)"
                        class="display-only"
                      />
                    </v-list>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <p v-else v-html="$t('settings.osc.params.empty')" />
      <v-card class="mt-2" color="transparent" flat>
        <v-card-actions>
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            icon="mdi-plus"
            @click="openAddParamDialog"
          />
        </v-card-actions>
      </v-card>
    </v-card-text>

    <!-- Profile Add Dialog -->
    <v-row justify="center">
      <v-dialog v-model="profile_add_dialog" width="50vw">
        <v-card v-click-outside="closeAddProfileDialog">
          <v-card-title>{{ $t('settings.osc.params.profile.dialog.title.add') }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col :cols="12">
                <v-form
                  v-model="new_profile_name_valid"
                  @submit.prevent="new_profile_name_valid ? confirmAddProfileDialog() : null"
                >
                  <v-text-field
                    v-model="new_profile_name"
                    :label="$t('settings.osc.params.profile.dialog.field_label')"
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
            <v-btn @click="closeAddProfileDialog">
              {{ $t('settings.osc.params.button.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!new_profile_name_valid"
              @click="confirmAddProfileDialog"
            >
              {{ $t('settings.osc.params.button.add') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- Profile Edit Dialog -->
    <v-row justify="center">
      <v-dialog v-model="profile_edit_dialog" width="50vw">
        <v-card v-click-outside="closeEditProfileDialog">
          <v-card-title>{{ $t('settings.osc.params.profile.dialog.title.edit') }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col :cols="12">
                <v-form
                  v-model="new_profile_name_valid"
                  @submit.prevent="new_profile_name_valid ? confirmEditProfileDialog() : null"
                >
                  <v-text-field
                    v-model="new_profile_name"
                    :label="$t('settings.osc.params.profile.dialog.field_label')"
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
            <v-btn @click="closeEditProfileDialog">
              {{ $t('settings.osc.params.button.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!new_profile_name_valid"
              @click="confirmEditProfileDialog"
            >
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
            <v-btn color="primary" @click="confirmDeleteProfileDialog">
              {{ $t('settings.osc.params.button.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- Param Trigger Dialog -->
    <v-row justify="center">
      <ParameterTrigger
        v-model="param_dialog"
        :mode="param_dialog_mode"
        :editing-index="param_editing_index"
      />
    </v-row>

    <!-- Param Trigger Delete Dialog -->
    <v-row justify="center">
      <v-dialog v-model="param_delete_dialog" width="50vw">
        <v-card>
          <v-card-title>{{ $t('settings.osc.params.param.delete_dialog.title') }}</v-card-title>
          <v-card-text>{{ `${param_delete_target_display}` }}</v-card-text>
          <v-card-text>{{ $t('settings.osc.params.param.delete_dialog.text') }}</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="param_delete_dialog = false">
              {{ $t('settings.osc.params.button.cancel') }}
            </v-btn>
            <v-btn color="primary" @click="confirmDeleteParamDialog">
              {{ $t('settings.osc.params.button.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ParameterTrigger from '@/components/settings/oscparams/dialogs/ParameterTrigger.vue'
import { useOSCStore } from '@/stores/osc'

const oscStore = useOSCStore()

const rules = ref({
  required: (value: string) => !!value || 'Required',
  empty: (value: string) => !!value.trim() || 'Cannot be empty',
  already_taken: (value: string, collection: object) => !(value in collection) || 'Already in use',
})

const new_profile_name = ref('')
const new_profile_name_valid = ref(false)

const profile_add_dialog = ref(false)

const profile_edit_dialog = ref(false)
const editing_profile_name = ref('')

const profile_delete_dialog = ref(false)
const profile_delete_target = ref('')

const param_panels = ref([])

const param_dialog = ref(false)
const param_dialog_mode = ref('') // "add", "edit"

const param_editing_index = ref(Number.NaN)

const param_delete_dialog = ref(false)
const param_delete_target = ref(Number.NaN)
const param_delete_target_display = ref('')

const sortedProfiles = computed(() => {
  return Object.keys(oscStore.osc_profiles).sort((a, b) => {
    if (a === 'Default')
      return -1 // The profile "Default" is always first.
    else if (b === 'Default')
      return 1
    else
      return a.localeCompare(b)
  })
})

function clearFocus() {
  const focusedElement = document.activeElement as HTMLElement

  if (focusedElement)
    focusedElement.blur()
}

function openAddProfileDialog() {
  clearFocus()

  new_profile_name.value = ''

  profile_add_dialog.value = true
}

function confirmAddProfileDialog() {
  oscStore.osc_profiles[new_profile_name.value] = []
  oscStore.current_profile = new_profile_name.value

  new_profile_name.value = ''

  profile_add_dialog.value = false
}

function closeAddProfileDialog() {
  profile_add_dialog.value = false
}

function openEditProfileDialog(profile_name: string) {
  clearFocus()

  editing_profile_name.value = profile_name
  new_profile_name.value = profile_name

  profile_edit_dialog.value = true
}

function confirmEditProfileDialog() {
  oscStore.osc_profiles[new_profile_name.value] = oscStore.osc_profiles[editing_profile_name.value]

  if (oscStore.current_profile === editing_profile_name.value)
    oscStore.current_profile = new_profile_name.value

  delete oscStore.osc_profiles[editing_profile_name.value]

  new_profile_name.value = ''

  profile_edit_dialog.value = false
}

function closeEditProfileDialog() {
  profile_edit_dialog.value = false
}

function openDeleteProfileDialog(profile_name: string) {
  profile_delete_target.value = profile_name

  profile_delete_dialog.value = true
}

function confirmDeleteProfileDialog() {
  if (oscStore.current_profile === profile_delete_target.value)
    oscStore.current_profile = 'Default'

  delete oscStore.osc_profiles[profile_delete_target.value]

  profile_delete_dialog.value = false
}

function setProfile(selected_profile: string) {
  oscStore.current_profile = selected_profile

  param_panels.value = [] // Collapse all parameter trigger expansion panels.
}

function displayAssignSubtitle(assign_object: any) {
  let subtitle = `set ${assign_object.type} to ${assign_object.set1}`

  if (assign_object.activation === 'pulse')
    subtitle = `${subtitle}, wait ${assign_object.pulse_duration}ms, set ${assign_object.type} to ${assign_object.set2}`

  return subtitle
}

function openAddParamDialog() {
  param_dialog_mode.value = 'add'
  param_dialog.value = true
}

function openEditParamDialog(i: number) {
  param_dialog_mode.value = 'edit'
  param_editing_index.value = i
  param_dialog.value = true
}

function openDeleteParamDialog(i: number) {
  const current_profile_params = oscStore.osc_profiles[oscStore.current_profile]

  param_delete_target.value = i
  param_delete_target_display.value = current_profile_params[i].route

  param_delete_dialog.value = true
}

function confirmDeleteParamDialog() {
  const current_profile_params = oscStore.osc_profiles[oscStore.current_profile]

  current_profile_params.splice(param_delete_target.value, 1)

  param_delete_dialog.value = false
}
</script>

<style>
.v-expansion-panel:not(:first-child)::after {
  border: none !important;
}

.v-expansion-panel {
  margin-top: 0 !important;
}

.v-expansion-panel-title__overlay {
  background-color: initial !important;
}

.param:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.param-route {
  /* This typography imitates Vuetify's class text-button. In the corresponding v-text-field, this class works, but Vuetify's class does not work. */
  font-size: 0.875rem !important;
  font-weight: 500;
  line-height: 2.25rem;
  letter-spacing: 0.0892857143em !important;
}

.param-route input {
  padding: 0 !important;
  cursor: pointer;
}

.display-only {
  pointer-events: none;
}

.assignment-editable:hover {
  text-decoration: line-through;
}
</style>
