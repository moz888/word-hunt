<template>
    <div v-show="visible" class="sb-w-full sb-h-full sb-flex sb-flex-col sb-bg-gray-100 sb-cursor-pointer">
        <!-- Header -->
        <div class="sb-flex sb-items-center sb-justify-between sb-bg-blue-500 sb-p-2 sb-w-full">
            <div class="sb-text-center sb-flex-grow sb-text-white sb-text-base sb-font-bold sb-w-3/4 sb-truncate">{{
                article.title || '' }}</div>
            <svg @click="onClose" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="sb-w-6 sb-h-6 sb-text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>

        <!-- List of Cards -->
        <div class="sb-p-2 sb-overflow-y-auto sb-w-full sb-h-[calc(100%-6rem)] sb-text-left">
            <div v-for="(card, index) in cards" :key="index" @click="onClickWord(card)"
                class="sb-bg-white sb-rounded sb-shadow sb-pl-4 sb-pr-4 sb-mb-4 sb-pb-3 sb-pt-2">
                <div class="sb-text-lg sb-font-bold sb-text-black">{{ card.key }}<span
                        class="sb-text-gray-600 sb-ml-1 sb-text-sm sb-font-normal sb-align-middle">{{ card.phonetic
                        }}</span></div>
                <div class="sb-mt-2 sb-whitespace-pre-line sb-text-gray-600 sb-text-sm">
                    <div v-for="meaning in card.meanings" class="sb-pt-1 sb-pb-1">
                        <span class="sb-bg-gray-200 sb-p-1">{{ meaning.pos.toLowerCase() }}:</span>
                        <div class="sb-mt-1 sb-mb-1" v-for="(definition, i) in meaning.definitions">{{ (i + 1) + '、' +
                            definition.definition }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
const browser = require('../../common/browser-polyfill')

export default {
    props: {
        article: {
            default: () => { },
            type: Object
        }
    },
    data() {
        return {
            visible: true,
            onClose: () => {
                this.visible = false
                this.$emit('close')
            },
            onDataLoaded: (empty) => {
                this.$emit('dataLoaded', empty)
            },
            onClickWord: (word) => {
                this.$emit('clickWord', word)
            },
            cards: []
        }
    },
    watch: {
        article: {
            handler(newValue, oldValue) {
                let self = this
                if (newValue.url) {
                    browser.runtime.sendMessage({ action: 'get_words', url: newValue.url })
                        .then((words) => {
                            const list = Object.entries(words).map(([key, value]) => ({ key, ...value }));
                            console.log(list)
                            self.cards = list
                            self.onDataLoaded(self.cards.length == 0)
                        })
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        addWord(word) {
            let card = Object.assign(word, { key: word.word })
            let cards = this.cards || []
            cards.push(card)
            this.cards = cards
            this.onDataLoaded(this.cards.length == 0)
        },
    }
};
</script>

<style scoped>
.sb-w-full {
    width: 100%;
}

.sb-h-full {
    height: 100%;
}

.sb-flex {
    display: flex;
}

.sb-flex-col {
    flex-direction: column;
}

.sb-bg-gray-100 {
    --sb-tw-bg-opacity: 1;
    background-color: rgb(243 244 246 / var(--sb-tw-bg-opacity));
}

.sb-cursor-pointer {
    cursor: pointer;
}

.sb-items-center {
    align-items: center;
}

.sb-justify-between {
    justify-content: space-between;
}

.sb-bg-blue-500 {
    --sb-tw-bg-opacity: 1;
    background-color: rgb(59 130 246 / var(--sb-tw-bg-opacity));
}

.sb-mt-1 {
    margin-top: 0.25rem
        /* 4px */
    ;
}

.sb-p-1 {
    padding: 0.25rem
        /* 4px */
    ;
}

.sb-p-2 {
    padding: 0.5rem
        /* 8px */
    ;
}

.sb-text-center {
    text-align: center;
}

.sb-flex-grow {
    flex-grow: 1;
}

.sb-text-white {
    --sb-tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--sb-tw-text-opacity));
}

.sb-text-base {
    font-size: 1rem
        /* 16px */
    ;
    line-height: 1.5rem
        /* 24px */
    ;
}

.sb-font-bold {
    font-weight: 700;
}

.sb-w-3\/4 {
    width: 75%;
}

.sb-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.sb-w-6 {
    width: 1.5rem
        /* 24px */
    ;
}

.sb-h-6 {
    height: 1.5rem
        /* 24px */
    ;
}

.sb-overflow-y-auto {
    overflow-y: auto;
}

.sb-h-\[calc\(100\%-6rem\)\] {
    height: calc(100% - 6rem);
}

.sb-bg-white {
    --sb-tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--sb-tw-bg-opacity));
}

.sb-rounded {
    border-radius: 0.25rem
        /* 4px */
    ;
}

.sb-shadow {
    --sb-tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --sb-tw-shadow-colored: 0 1px 3px 0 var(--sb-tw-shadow-color), 0 1px 2px -1px var(--sb-twshadow-color);
    box-shadow: var(--sb-tw-ring-offset-shadow, 0 0 #0000), var(--sb-tw-ring-shadow, 0 0 #0000), var(--sb-tw-shadow);
}

.sb-pt-1 {
    padding-top: 0.25rem
        /* 4px */
    ;
}

.sb-pb-1 {
    padding-bottom: 0.25rem
        /* 4px */
    ;
}

.sb-pl-4 {
    padding-left: 1rem
        /* 16px */
    ;
}

.sb-pr-4 {
    padding-right: 1rem
        /* 16px */
    ;
}

.sb-pt-2 {
    padding-top: 0.5rem
        /* 8px */
    ;
}

.sb-pb-2 {
    padding-bottom: 0.5rem
        /* 8px */
    ;
}

.sb-pb-3 {
    padding-bottom: 0.75rem
        /* 12px */
    ;
}

.sb-mb-4 {
    margin-bottom: 1rem
        /* 16px */
    ;
}

.sb-text-lg {
    font-size: 1.125rem
        /* 18px */
    ;
    line-height: 1.75rem
        /* 28px */
    ;
}

.sb-font-bold {
    font-weight: 700;
}

.sb-text-black {
    --sb-tw-text-opacity: 1;
    color: rgb(0 0 0 / var(--sb-tw-text-opacity));
}

.sb-text-gray-600 {
    --sb-tw-text-opacity: 1;
    color: rgb(75 85 99 / var(--sb-tw-text-opacity));
}

.sb-ml-1 {
    margin-left: 0.25rem
        /* 4px */
    ;
}

.sb-text-sm {
    font-size: 0.875rem
        /* 14px */
    ;
    line-height: 1.25rem
        /* 20px */
    ;
}

.sb-font-normal {
    font-weight: 400;
}

.sb-align-middle {
    vertical-align: middle;
}

.sb-mt-2 {
    margin-top: 0.5rem
        /* 8px */
    ;
}

.sb-mb-1 {
    margin-bottom: 0.25rem
        /* 4px */
    ;
}

.sb-whitespace-pre-line {
    white-space: pre-line;
}

.sb-text-gray-600 {
    --sb-tw-text-opacity: 1;
    color: rgb(75 85 99 / var(--sb-tw-text-opacity));
}

.sb-bg-gray-200 {
    --sb-tw-text-opacity: 1;
    background-color: rgb(229 231 235 / var(--sb-tw-text-opacity));
}

.sb-text-sm {
    font-size: 0.875rem
        /* 14px */
    ;
    line-height: 1.25rem
        /* 20px */
    ;
}

.sb-text-left {
    text-align: left;
}</style>
  