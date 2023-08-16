const browser = require('./browser-polyfill')
class DStorage {
    constructor(id) {
      this.id = id;
      this.dict = null
    }
    load(cb){
        const self = this
        if(!this.dict){
            const id = this.id
            browser.storage.local.get(id).then((results) => {
                self.dict = results[id] || {}
                cb && cb(self.dict)
            });
        } else{
            cb && cb(this.dict)
        }
    }
    get(key,cb){
        this.load((dict)=>{
            cb && cb(dict[key])
        })        
    }
    getAll(cb){
        this.load((dict)=>{
            cb && cb(dict)
        }) 
    }
    set(kv,cb){
        const id = this.id
        this.load((dict)=>{
            const {key, value} = kv
            if(!dict[key]){
                dict[key] = value
                console.log(id)
                browser.storage.local.set({[id]: dict});
            }
            cb && cb()
        })   
    }
    setAll(dict, cb){
        this.dict = dict || {}
        browser.storage.local.set({[this.id]: this.dict});
    }
    del(key, cb){
        const id = this.id
        this.load((dict)=>{
            if(dict[key]){
                delete dict[key]
                if(Object.keys(dict).length === 0){
                    browser.storage.local.remove(id)
                } else{
                    browser.storage.local.set({[id]: dict});
                }
            }
            cb && cb()
        })  
    }
    delAll(cb){
        browser.storage.local.remove(this.id)
        cb && cb()
    }
  }


function removeAnchorFromURL(url) {
    const anchorIndex = url.indexOf('#');
    if (anchorIndex !== -1) {
      return url.slice(0, anchorIndex);
    }
    return url;
  }

function getHostWithUrl(url){
    return new URL(url).host;
}

function extractHostFromURL(url) {
    // Create a new URL object with the input URL
    const parsedURL = new URL(url);
  
    // Get the hostname from the URL
    let host = parsedURL.hostname;
  
    // Remove 'www.' from the beginning of the hostname if it exists
    host = host.replace(/^www\./, '');
  
    // Return the modified host
    return host;
  }

function getNameByDatetime(name){
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    const fileName = `${year}${month}${day}_${hours}${minutes}${seconds}_${name}`;
}

function isEnglishStr(str){
    if(!str)return false
    var pattern = new RegExp("[A-Za-z]+");
    if(pattern.test(str)){
        return true
    }
    return false
}

function checkSurroundings(text, subtext, idx) {
    if (idx < 0 || idx + subtext.length > text.length) {
        return false;
    }

    var startTag = '<mark class="mark_highlight_yellow">';
    var endTag = '</mark>';

    var prefix = text.substring(idx - startTag.length, idx);
    var suffix = text.substring(idx + subtext.length, idx + subtext.length + endTag.length);

    return prefix === startTag && suffix === endTag;
}

function findSubstringIndexes(text, subtext) {
    var indexes = [];
    var index = text.indexOf(subtext);

    while (index !== -1) {
        indexes.push(index);
        index = text.indexOf(subtext, index + 1);
    }

    return indexes;
}

function isMarkedHighlight(innerHTML, word, idx) {
    var indexes = findSubstringIndexes(innerHTML, word)
    if (idx < 0 || idx > indexes) return true;
    var targetIdx = indexes[idx]
    return checkSurroundings(innerHTML, word, targetIdx)
}

export {
    DStorage, 
    removeAnchorFromURL,
    getHostWithUrl,
    getNameByDatetime,
    extractHostFromURL,
    isEnglishStr,
    isMarkedHighlight
}