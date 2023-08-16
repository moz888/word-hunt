const browser = require('../common/browser-polyfill')
import { DStorage, removeAnchorFromURL,getNameByDatetime } from '@/common/tools';

const pageKey = 'page';
const pageStorage = new DStorage(pageKey);

pageStorage.load((pages)=>{
    console.log(pages)
})

function saveCurrentPage(sender){
    const {tab} = sender
    const page = {
        title: tab.title,
        url: removeAnchorFromURL(tab.url)
    }
    pageStorage.set({key: page.url, value: page.title})
}

function delPage(context, callback){
    const {url} = context
    pageStorage.del(removeAnchorFromURL(url), callback)
}

function savePageWord(context, wordContxt, callback){
    const {url} = context
    const {content} = wordContxt,
        {word} = content
    delete content.word
    new DStorage(removeAnchorFromURL(url)).set({key: word, value: content},callback)
}

function getPageWords(context, callback){
    const {url} = context
    new DStorage(removeAnchorFromURL(url)).getAll(callback)
}

function delPageWords(context, callback){
    const {url} = context
    new DStorage(removeAnchorFromURL(url)).delAll(callback)
}

function query(request, sender, sendResponse) {
    var { context } = request, 
        {word, language, include} = context,
        url = `https://www.bing.com/search?FORM=DCTRQY&q=define+${word}`;

    fetch(url)
    .then((response) => response.text())
    .then((text) => {
        sendResponse({ context, html: text });
    }).catch(err=>{
        sendResponse({ context });
    })
}

function exportDictionary() {
    browser.storage.local.get(null, function(result) {
        const blob = new Blob([JSON.stringify(result)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        browser.downloads.download({
          url: url,
          filename: getNameByDatetime('dict.txt'),
          saveAs: false
        });
    });
  }

function importDictionary(dict){
    for (const key in dict) {
        if(key == pageKey){
            pageStorage.setAll(dict[key])
        } else {
            new DStorage(key).setAll(dict[key])
        }
    }
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == 'fetch'){
        query(request, sender, sendResponse)
    } else if (request.action == 'get_pages'){
        pageStorage.load(sendResponse)
    } else if (request.action == 'del_page'){
        delPage(request)
        delPageWords(request, sendResponse)
    } else if (request.action == 'get_words'){
        getPageWords(request, sendResponse)
    } else if (request.action == 'save_word'){
        savePageWord(sender, request, sendResponse)
        saveCurrentPage(sender)
    } else if (request.action == 'export'){
        exportDictionary()
    } else if (request.action == 'import'){
        importDictionary(request.content)
    }
    return true;
});

browser.runtime.onInstalled.addListener(() => {
    console.log("插件已安装");
 });