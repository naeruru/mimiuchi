<template>
    <v-card :title="$t('settings.word_replace.title')" :subtitle="$t('settings.word_replace.description')" color="transparent" flat>
        <v-divider></v-divider>
        <v-card-text>
            
            <v-card flat>
                <v-switch
                    v-model="wordReplaceStore.enabled"
                    :label="$t('settings.word_replace.enabled')"
                    color="primary"
                    hide-details
                    inset
                    class="mx-3"
                ></v-switch>
            </v-card>
            <div v-if="replacements.length" class="mt-6">
                <v-row v-for="(replacement, i) in replacements">
                        <v-col :cols="12" :sm="6">
                            <v-text-field v-model="replacement.replacing" :label="$t('settings.word_replace.replacing')" append-icon="mdi-arrow-right-bold" hide-details></v-text-field>
                        </v-col>
                        <v-col :cols="10" :sm="6">
                            <v-text-field v-model="replacement.replacement" :label="$t('settings.word_replace.replacement')" hide-details>

                                <template v-slot:append>
                                    <v-btn size="x-small" color="red" icon="mdi-minus" @click="remove_entry(i)"></v-btn>
                                </template>
                            </v-text-field>
                        </v-col>
                </v-row>
            </div>
            <p v-else class="mt-6">{{ $t('settings.word_replace.info') }}</p>
            <v-card class="mt-4" color="transparent" flat>
                <v-card-actions>
                    <v-btn color="primary" variant="outlined" size="small" icon="mdi-plus" @click="add_entry()"></v-btn>
                </v-card-actions>
            </v-card>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">
import { useWordReplaceStore } from  '../../stores/word_replace'

export default {
    name: 'WordReplace',
    data: () => ({
        replacements: [] as {replacing: string, replacement: string}[]
    }),
    methods: {
        add_entry() {
            // this.wordReplaceStore.word_replacements[""] = ""
            this.replacements.push({
                replacing: "",
                replacement: ""
            })
        },
        remove_entry(i: number) {
            this.replacements.splice(i, 1)
            // delete this.wordReplaceStore.word_replacements[this.replacement_list[i].replacing]
        }
    },
    unmounted() {
        this.wordReplaceStore.word_replacements = {}
        this.replacements.forEach(entry => {
            this.wordReplaceStore.word_replacements[entry.replacing.toLowerCase()] = entry.replacement
        })
    },
    mounted() {
        this.replacements = Object.entries(this.wordReplaceStore.word_replacements).map(([replacing, replacement]) => ({
             replacing: replacing,
             replacement: replacement
        }))
        // console.log(this.replacements)
    },
    setup() {
        const wordReplaceStore = useWordReplaceStore()

        return {
            wordReplaceStore
        }
    }
}
</script>
