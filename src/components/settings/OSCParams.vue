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
            <template v-slot:item="{ item }">
              <v-list-item @click="oscStore.current_profile = item.title">
                <div class="d-flex align-center">
                  <v-list-item-title class="flex-grow-1">
                    {{ item.title }}
                  </v-list-item-title>
                  <v-list-item-action>
                    <v-btn
                      icon
                      variant="plain"
                      density="comfortable"
                      @click.stop="openEditProfileDialog(item.title)"
                    >
                      <v-icon v-if="item.title !== 'Default'">mdi-pencil-outline</v-icon>
                    </v-btn>
                  </v-list-item-action>
                  <v-list-item-action class="ml-2">
                    <v-btn
                      icon
                      variant="plain"
                      density="comfortable"
                      @click.stop="openDeleteProfileDialog(item.title)"
                    >
                      <v-icon v-if="item.title !== 'Default'">mdi-close</v-icon>
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
      <v-card
        v-if="Object.keys(oscStore.osc_profiles[oscStore.current_profile]).length > 0"
        v-for="(param, i) in oscStore.osc_profiles[oscStore.current_profile]"
        class="mb-4"
      >
        <v-card color="rgba(0, 0, 0, 0)">
          <v-card-title class="d-flex align-center">
            {{ param.route }}
            <v-spacer />
            <v-btn
              class="ml-4"
              flat
              variant="text"
              size="small"
              color="primary"
              append-icon="mdi-pencil"
              @click="openEditParamDialog(i)"
            >
              {{ $t('settings.osc.params.param.button.edit') }}
            </v-btn>
            <v-btn
              class="ml-4"
              flat variant="text"
              size="small"
              color="error"
              append-icon="mdi-delete"
              @click="deleteParam(i)"
            >
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
                <v-text-field
                  v-model="param.ip"
                  :label="$t('settings.osc.general.osc_ip')"
                  variant="outlined"
                  hide-details readonly
                />
              </v-col>
              <v-col>
                <v-text-field
                  v-model="param.port"
                  :label="$t('settings.osc.general.osc_port')"
                  variant="outlined"
                  hide-details
                  readonly
                />
              </v-col>

              <v-col :cols="12">
                <strong v-html="$t('settings.osc.params.param.trigger_phrases')"></strong>
              </v-col>
              <v-col :cols="12">
                <v-chip
                  v-for="(keyword, i) in param.keywords"
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
                <v-text-field
                  v-model="new_profile_name"
                  :label="$t('settings.osc.params.profile.dialog.field_label')"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="closeAddProfileDialog">
              {{ $t('settings.osc.params.button.cancel') }}
            </v-btn>
            <v-btn color="primary" @click="confirmAddProfileDialog">
              {{ $t('settings.osc.params.button.add') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- Profile Edit Dialog -->
    <v-row justify="center">
      <v-dialog v-model="profile_edit_dialog" width="50vw">
        <v-card v-click-outside="confirmEditProfileDialog">
          <v-card-title>{{ $t('settings.osc.params.profile.dialog.title.edit') }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col :cols="12">
                <v-text-field
                  v-model="new_profile_name"
                  :label="$t('settings.osc.params.profile.dialog.field_label')"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="closeEditProfileDialog">
              {{ $t('settings.osc.params.button.cancel') }}
            </v-btn>
            <v-btn color="primary" @click="confirmEditProfileDialog">
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
            <v-btn color="primary" @click="confirmDeleteProfileDialog()">
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
import ParameterTrigger from '@/components/settings/oscparams/dialogs/ParameterTrigger.vue'
import { useOSCStore } from '@/stores/osc'

export default {
  name: 'SettingsGeneral',
  components: { ParameterTrigger },
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
    new_profile_name: '',
    
    profile_add_dialog: false,
    
    profile_edit_dialog: false,
    editing_profile_name: '',
    
    profile_delete_dialog: false,
    profile_delete_target: '',
    
    param_dialog: false,
    param_dialog_mode: '', // "add", "edit"
    param_editing_index: NaN,
  }),
  computed: {
    sortedProfiles() {
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

      this.profile_add_dialog = true
    },
    confirmAddProfileDialog() {
      if (!this.new_profile_name.trim()) // The profile name field is empty.
        return

      if (this.new_profile_name in this.oscStore.osc_profiles) // The profile name is already being used.
        return

      this.oscStore.osc_profiles[this.new_profile_name] = []
      this.oscStore.current_profile = this.new_profile_name

      this.new_profile_name = '' // Reset the dialog's field.

      this.profile_add_dialog = false
    },
    closeAddProfileDialog()
    {
      this.profile_add_dialog = false
    },
    openEditProfileDialog(profile_name: string) {
      this.editing_profile_name = profile_name
      this.new_profile_name = profile_name

      this.profile_edit_dialog = true
    },
    confirmEditProfileDialog() {
      if (!this.new_profile_name.trim()) // The profile name field is empty.
        return

      if (this.new_profile_name in this.oscStore.osc_profiles) // The profile name is already being used.
        return

      this.oscStore.osc_profiles[this.new_profile_name] = this.oscStore.osc_profiles[this.editing_profile_name]

      if (this.oscStore.current_profile === this.editing_profile_name)
        this.oscStore.current_profile = this.new_profile_name

      delete this.oscStore.osc_profiles[this.editing_profile_name]

      this.new_profile_name = '' // Reset the dialog's field.

      this.profile_edit_dialog = false
    },
    closeEditProfileDialog()
    {
      this.profile_edit_dialog = false
    },
    openDeleteProfileDialog(profile_name: string) {
      this.profile_delete_target = profile_name

      this.profile_delete_dialog = true
    },
    confirmDeleteProfileDialog() {
      if (this.oscStore.current_profile === this.profile_delete_target)
        this.oscStore.current_profile = "Default"

      delete this.oscStore.osc_profiles[this.profile_delete_target]

      this.profile_delete_dialog = false
    },
    openAddParamDialog() {
      this.param_dialog_mode = "add"
      this.param_dialog = true
    },
    openEditParamDialog(i: number) {
      this.param_dialog_mode = "edit"
      this.param_editing_index = i
      this.param_dialog = true
    },
    deleteParam(i: number) {
      this.oscStore.osc_profiles[this.oscStore.current_profile].splice(i, 1)
    },
  },
}
</script>
