<template>
  <v-card color="transparent" flat class="pb-16">
    <template #title>
      <span>{{ $t('settings.osc.triggers.title') }}</span>
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
      <span>{{ $t('settings.osc.triggers.description') }}</span>
    </template>

    <v-divider />

    <v-card-text>
      <!-- Profiles -->
      <v-row>
        <v-col :cols="10" class="d-flex align-center">
          <v-select
            v-model="oscStore.current_profile"
            :label="$t('settings.osc.triggers.profile.label')"
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

      <!-- Triggers -->
      <v-expansion-panels
        v-if="Object.keys(oscStore.osc_profiles[oscStore.current_profile]).length > 0"
        v-model="trigger_panels"
        multiple
      >
        <v-expansion-panel
          v-for="(trigger, i) in oscStore.osc_profiles[oscStore.current_profile]"
          class="mb-4"
        >
          <v-expansion-panel-title ripple class="trigger-panel d-flex align-center">
            <v-text-field
              v-model="trigger.route"
              variant="plain"
              flat
              density="compact"
              hide-details
              readonly
              class="trigger-route w-100"
            />
            <v-spacer />
            <v-btn
              class="ml-4"
              flat
              variant="text"
              size="small"
              color="primary"
              append-icon="mdi-pencil"
              @click.stop="openEditTriggerDialog(i)"
            >
              {{ $t('settings.osc.triggers.trigger.button.edit') }}
            </v-btn>
            <v-btn
              class="ml-4 mr-4"
              flat variant="text"
              size="small"
              color="error"
              append-icon="mdi-delete"
              @click.stop="openDeleteTriggerDialog(i)"
            >
              {{ $t('settings.osc.triggers.trigger.button.delete') }}
            </v-btn>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card flat>
              <v-card-text>
                <v-row>
                  <v-col :cols="12" :md="6">
                    <v-text-field
                      v-model="trigger.ip"
                      :label="$t('settings.osc.general.osc_ip')"
                      flat
                      variant="solo-filled"
                      hide-details
                      readonly
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="trigger.port"
                      :label="$t('settings.osc.general.osc_port')"
                      flat
                      variant="solo-filled"
                      hide-details
                      readonly
                    />
                  </v-col>

                  <v-col :cols="12">
                    <strong>{{ $t('settings.osc.triggers.trigger.trigger_phrases') }}</strong>
                  </v-col>
                  <v-col :cols="12">
                    <v-chip
                      v-for="(keyword) in trigger.keywords"
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
                    <strong>{{ $t('settings.osc.triggers.trigger.assign.phrases') }}</strong>
                    <v-list density="compact">
                      <v-list-item
                        v-for="(assign) in trigger.assigns"
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
      <p v-else>
        <i18n-t keypath="settings.osc.triggers.empty" tag="label" scope="global">
          <template #icon>
            <v-icon
              color="primary"
              size="small"
            >
              mdi-plus-circle-outline
            </v-icon>
          </template>
        </i18n-t>
      </p>
      <v-card class="mt-2" color="transparent" flat>
        <v-card-actions>
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            icon="mdi-plus"
            @click="openAddTriggerDialog"
          />
        </v-card-actions>
      </v-card>
    </v-card-text>

    <!-- Profile Dialog -->
    <v-row justify="center">
      <Profile
        v-model="profile_dialog"
        :mode="profile_dialog_mode"
        :new_name="profile_dialog_new_name"
      />
    </v-row>

    <!-- Profile Delete Dialog -->
    <v-row justify="center">
      <v-dialog v-model="profile_delete_dialog" width="50vw">
        <v-card>
          <v-card-title>{{ $t('settings.osc.triggers.profile.delete_dialog.title') }}</v-card-title>
          <v-card-text>{{ `${profile_delete_target}` }}</v-card-text>
          <v-card-text>{{ $t('settings.osc.triggers.profile.delete_dialog.text') }}</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="profile_delete_dialog = false">
              {{ $t('settings.osc.triggers.button.cancel') }}
            </v-btn>
            <v-btn color="primary" @click="confirmDeleteProfileDialog">
              {{ $t('settings.osc.triggers.button.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- Trigger Dialog -->
    <v-row justify="center">
      <Trigger
        v-model="trigger_dialog"
        :mode="trigger_dialog_mode"
        :editing-index="trigger_editing_index"
      />
    </v-row>

    <!-- Trigger Delete Dialog -->
    <v-row justify="center">
      <v-dialog v-model="trigger_delete_dialog" width="50vw">
        <v-card>
          <v-card-title>{{ $t('settings.osc.triggers.trigger.delete_dialog.title') }}</v-card-title>
          <v-card-text>{{ `${trigger_delete_target_display}` }}</v-card-text>
          <v-card-text>{{ $t('settings.osc.triggers.trigger.delete_dialog.text') }}</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="trigger_delete_dialog = false">
              {{ $t('settings.osc.triggers.button.cancel') }}
            </v-btn>
            <v-btn color="primary" @click="confirmDeleteTriggerDialog">
              {{ $t('settings.osc.triggers.button.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOSCStore } from '@/stores/osc'
import Profile from '@/components/settings/osctriggers/dialogs/Profile.vue'
import Trigger from '@/components/settings/osctriggers/dialogs/Trigger.vue'

const oscStore = useOSCStore()

const profile_dialog = ref(false)
const profile_dialog_mode = ref('') // "add", "edit"
const profile_dialog_new_name = ref('')

const profile_delete_dialog = ref(false)
const profile_delete_target = ref('')

const trigger_panels = ref([])

const trigger_dialog = ref(false)
const trigger_dialog_mode = ref('') // "add", "edit"

const trigger_editing_index = ref(Number.NaN)

const trigger_delete_dialog = ref(false)
const trigger_delete_target = ref(Number.NaN)
const trigger_delete_target_display = ref('')

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

  profile_dialog_mode.value = 'add'
  profile_dialog_new_name.value = ''

  profile_dialog.value = true
}

function openEditProfileDialog(profile_name: string) {
  clearFocus()

  profile_dialog_mode.value = 'edit'
  profile_dialog_new_name.value = profile_name

  profile_dialog.value = true
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

  trigger_panels.value = [] // Collapse all trigger expansion panels.
}

function displayAssignSubtitle(assign_object: any) {
  let subtitle = `set ${assign_object.type} to ${assign_object.set1}`

  if (assign_object.activation === 'pulse')
    subtitle = `${subtitle}, wait ${assign_object.pulse_duration}ms, set ${assign_object.type} to ${assign_object.set2}`

  return subtitle
}

function openAddTriggerDialog() {
  trigger_dialog_mode.value = 'add'
  trigger_dialog.value = true
}

function openEditTriggerDialog(i: number) {
  trigger_dialog_mode.value = 'edit'
  trigger_editing_index.value = i
  trigger_dialog.value = true
}

function openDeleteTriggerDialog(i: number) {
  const current_profile_triggers = oscStore.osc_profiles[oscStore.current_profile]

  trigger_delete_target.value = i
  trigger_delete_target_display.value = current_profile_triggers[i].route

  trigger_delete_dialog.value = true
}

function confirmDeleteTriggerDialog() {
  const current_profile_triggers = oscStore.osc_profiles[oscStore.current_profile]

  current_profile_triggers.splice(trigger_delete_target.value, 1)

  trigger_delete_dialog.value = false
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

.trigger-panel:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.trigger-panel-route {
  /* This typography imitates Vuetify's class text-button. In the corresponding v-text-field, this class works, but Vuetify's class does not work */
  font-size: 0.875rem !important;
  font-weight: 500;
  line-height: 2.25rem;
  letter-spacing: 0.0892857143em !important;
}

.trigger-panel-route input {
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
