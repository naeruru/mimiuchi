<template>
    <v-card color="transparent" flat>
        <v-card-title>
            Speech-to-text
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
            meow {{ $route.fullPath }}
            <v-row>
                <v-col :cols="12" :md="6">
                    <!-- <v-combobox
                        v-model="language_choice"
                        :items="languages"
                        label="Language"
                    ></v-combobox> -->
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">

export default {
    name: 'STT',
    data: () => ({
        language_choice: "",
        languages: [
            {
                name: "English (United States)",
                code: "en-US"
            },
            {
                name: "日本語（日本）",
                code: "ja-JP"
            }
        ]
    }),
    methods: {

    },
    computed: {

    },
    mounted() {
        
    }
}
</script>