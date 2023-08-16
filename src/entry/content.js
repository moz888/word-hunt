const browser = require('../common/browser-polyfill')
const api = require('../common/api')
import { loading, showMeaning, removeMeaning, restoreElementForXPath } from "@/common/meaning";
import { isMarkedHighlight } from "@/common/tools";
import { sidebar } from "@/view/component/sidebar";

class Debouncer {
    constructor(delay) {
        this.delay = delay;
        this.timerId = null;
    }

    debounce(func, ...args) {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
            console.log('exec func');
            func(...args);
        }, this.delay);
    }
}

const debouncer = new Debouncer(2000);

let WORDS = {}

function highlightWord(word, context) {
    const { xpath, idx } = context.pos

    const element = restoreElementForXPath(xpath)
    if (!element) return;
    if (element.nodeName == 'MARK') return;

    if (isMarkedHighlight(element.innerHTML, word, idx)) return;

    const text = element.innerHTML;
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    let currentIdx = -1;

    const highlightedText = text.replace(regex, (match) => {
        currentIdx++;
        if (currentIdx === idx) {
            return `<mark class="mark_highlight_yellow">${match}</mark>`;
        } else {
            return match;
        }
    });

    element.innerHTML = highlightedText;

}

function highlightWords(words) {
    let entries = Object.entries(words);
    for (let [word, value] of entries) {
        highlightWord(word, value)
    }
}

function observePageChanges() {
    const observer = new MutationObserver(function (mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.target === document.body && mutation.addedNodes.length > 0 && !Array.from(mutation.addedNodes).find((node) => node.nodeName === 'SCRIPT')) {
                console.log(mutation)
                console.log('Page content has changed.');
                debouncer.debounce(highlightWords, WORDS);
            }
        }
    });

    // Start observing changes to the document.body without observing its child elements
    observer.observe(document.body, { childList: true, subtree: false });
}

requestIdleCallback(function () {
    observePageChanges();
});

var TRIGGER_KEY = 'none';

function popupMeaning(event) {
    let info = loading(event)
    if (!info) { return; }
    const { word, pos } = info
    if (WORDS[word]) {
        showMeaning(Object.assign(WORDS[word], { word }))
        highlightWord(word, Object.assign(WORDS[word], { pos: info.pos }))
        var content = Object.assign(WORDS[word], { pos, word })
        browser.runtime.sendMessage({ action: 'save_word', content })
            .then((response) => { })
        return
    }

    api.tranlate(word, 'zh-CHS', {pos})
        .then(content=>{
            if (!content) { return showMeaning(null) }
            showMeaning(content)
            console.log(content)
            const { word } = content;
            WORDS[word] = content
            highlightWord(word, content)
            browser.runtime.sendMessage({ action: 'save_word', content })
                .then((response) => { })
            sidebar.addWord(content)
        })
        .catch(err=>{
            showMeaning(null)
        })
}

document.addEventListener('dblclick', ((e) => {

    if (sidebar.isEventTarget(e.target)) return;

    if (TRIGGER_KEY === 'none') {
        return popupMeaning(e);
    }

    //e has property altKey, shiftKey, cmdKey representing they key being pressed while double clicking.
    if (e[`${TRIGGER_KEY}Key`]) {
        return popupMeaning(e);
    }

    return;
}));

document.addEventListener('click', removeMeaning);

(function () {
    browser.runtime.sendMessage({ action: 'get_words', url: window.location.href })
        .then((response) => {
            WORDS = response
            console.log(response)
            highlightWords(WORDS)
        })
})();

sidebar.setup()

