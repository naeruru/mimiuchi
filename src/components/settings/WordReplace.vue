<template>
  <v-card :title="$t('settings.word_replace.title')" :subtitle="$t('settings.word_replace.description')" color="transparent" flat>
    <v-divider />
    <v-card-text>
      <v-card flat>
        <v-list-item :title="$t('settings.word_replace.enabled')">
          <template #append>
            <v-switch
              v-model="wordReplaceStore.enabled"
              color="primary"
              hide-details
              inset
            />
          </template>
        </v-list-item>
      </v-card>
      <v-row class="mt-6">
        <v-col :cols="12" :sm="6">
          <v-card flat>
            <v-list-item :title="$t('settings.word_replace.match_whole_word')">
              <template #append>
                <v-switch
                  v-model="wordReplaceStore.match_whole_word"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col :cols="12" :sm="6">
          <v-card flat>
            <v-list-item :title="$t('settings.word_replace.match_case')">
              <template #append>
                <v-switch
                  v-model="wordReplaceStore.match_case"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
      <div v-if="replacements.length" class="mt-6">
        <v-row v-for="(replacement, i) in replacements">
          <v-col :cols="12" :sm="6" class="pt-1 pb-0">
            <v-text-field v-model="replacement.replacing" :label="$t('settings.word_replace.replacing')" :rules="[exists]" append-icon="mdi-arrow-right-bold" />
          </v-col>
          <v-col :cols="10" :sm="6" class="pt-1 pb-0">
            <v-text-field v-model="replacement.replacement" :label="$t('settings.word_replace.replacement')" hide-details>
              <template #append>
                <v-btn size="x-small" color="red" icon="mdi-minus" @click="remove_entry(i)" />
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </div>
      <p v-else class="mt-6">
        {{ $t('settings.word_replace.info') }}
      </p>
      <v-card class="mt-4" color="transparent" flat>
        <v-card-actions>
          <v-btn color="primary" variant="outlined" size="small" icon="mdi-plus" @click="add_entry()" />
        </v-card-actions>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useWordReplaceStore } from '@/stores/word_replace'

export default {
  name: 'WordReplace',
  setup() {
    const wordReplaceStore = useWordReplaceStore()

    return {
      wordReplaceStore,
    }
  },
  data: () => ({
    replacements: [] as { replacing: string, replacement: string }[],
  }),
  unmounted() {
    this.wordReplaceStore.word_replacements = {}

    this.replacements
      .sort((a, b) => a.replacing.localeCompare(b.replacing)) // Sort keys by locale (e.g., alphabetical sort). This is cosmetic.
      .sort((a, b) => b.replacing.length - a.replacing.length) // Sort keys by string length: longer strings to shorter strings.
      .forEach((entry) => {
        this.wordReplaceStore.word_replacements[entry.replacing] = entry.replacement
      })

    this.wordReplaceStore.word_replacements_lowercase = {}

    Object.keys(this.wordReplaceStore.word_replacements).forEach((key) => {
      const keyLowerCase = key.toLowerCase()

      // First-come, first-served.
      // For example, the replacement keys "Hello" and "hello" are both transformed to lowercase as "hello".
      // When ordered by locale, their order is ["hello", "Hello"]. The replacement entry for "hello" will be used in case-insensitive replacements.
      if (!this.wordReplaceStore.word_replacements_lowercase[keyLowerCase])
        this.wordReplaceStore.word_replacements_lowercase[keyLowerCase] = this.wordReplaceStore.word_replacements[key]
    })
  },
  mounted() {
    this.replacements = Object.entries(this.wordReplaceStore.word_replacements).map(([replacing, replacement]) => ({
      replacing,
      replacement,
    }))
  },
  methods: {
    add_entry() {
      this.replacements.push({
        replacing: '',
        replacement: '',
      })
    },
    remove_entry(i: number) {
      this.replacements.splice(i, 1)
    },
    exists(value: string) {
      return !value || this.replacements.filter((e: any) => value === e.replacing).length < 2 || `${value} already exists`
    },
  },
}
</script>
