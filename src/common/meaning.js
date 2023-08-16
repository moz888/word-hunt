const POPUP_ID = "_FSKJF827872DJHDKHD_";
const   HEADING_ID = `${POPUP_ID}_heading`,
        MEANING_ID = `${POPUP_ID}_meaning`,
        MORE_ID = `${POPUP_ID}_moreInfo`,
        AUDIO_ID = `${POPUP_ID}_audio`;

function getWordIndex(text, word, offset) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    let match;
    let wordIndex = -1;

    while ((match = regex.exec(text)) !== null) {
        wordIndex++;
        if ((match.index <= offset && regex.lastIndex >= offset)) {
            break
        }
    }

    return wordIndex;
}

function getXPathForElement(container) {
    const element = container.nodeType === 3 ? container.parentElement : container;
    const idx = (sib, name) => sib
        ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name)
        : 1;
    const segs = elm => !elm || elm.nodeType !== 1
        ? ['']
        : elm.id && document.querySelector(`#${elm.id}`) === elm
            ? [`id('${elm.id}')`]
            : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
    return segs(element).join('/');
}

function restoreElementForXPath(xpath) {
    try {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
    } catch (error) {
        return null
    }
}

function getSelectionCoords(selection) {
    var oRange = selection.getRangeAt(0); //get the text range
    var oRect = oRange.getBoundingClientRect();
    return oRect;
}

function getSelectionInfo(event) {
    var word;
    var boundingRect;
    var xpath;
    var idx = 0;
    if (window.getSelection().toString().length > 1) {
        word = window.getSelection().toString();
        boundingRect = getSelectionCoords(window.getSelection());
        const rangeAt0 = window.getSelection().getRangeAt(0)
        console.log(rangeAt0)
        const selectedElement = rangeAt0.commonAncestorContainer;
        xpath = getXPathForElement(selectedElement);
        idx = getWordIndex(selectedElement.parentNode.textContent, word, rangeAt0.startOffset)
    } else {
        return null;
    }

    var top = boundingRect.top + window.scrollY,
        bottom = boundingRect.bottom + window.scrollY,
        left = boundingRect.left + window.scrollX;

    if (boundingRect.height == 0) {
        top = event.pageY;
        bottom = event.pageY;
        left = event.pageX;
    }

    return {
        top: top,
        bottom: bottom,
        left: left,
        word: word,
        clientY: event.clientY,
        height: boundingRect.height,
        pos: { xpath, idx }
    };
}

function createDiv(info) {
    var hostDiv = document.createElement("div");

    hostDiv.id = POPUP_ID;
    hostDiv.className = "dictionaryDiv";
    hostDiv.style.left = info.left - 10 + "px";
    hostDiv.style.position = "absolute";
    hostDiv.style.zIndex = "1000000"
    hostDiv.attachShadow({ mode: 'open' });

    var shadow = hostDiv.shadowRoot;
    var style = document.createElement("style");
    //style.textContent = "*{ all: initial}";
    style.textContent = ".mwe-popups{background:#fff;position:absolute;z-index:110;-webkit-box-shadow:0 30px 90px -20px rgba(0,0,0,0.3),0 0 1px #a2a9b1;box-shadow:0 30px 90px -20px rgba(0,0,0,0.3),0 0 1px #a2a9b1;padding:0;font-size:14px;min-width:300px;border-radius:2px}.mwe-popups.mwe-popups-is-not-tall{width:320px}.mwe-popups .mwe-popups-container{color:#222;margin-top:-9px;padding-top:9px;text-decoration:none}.mwe-popups.mwe-popups-is-not-tall .mwe-popups-extract{min-height:40px;max-height:140px;overflow:hidden;margin-bottom:47px;padding-bottom:0}.mwe-popups .mwe-popups-extract{margin:16px;display:block;color:#222;text-decoration:none;position:relative} .mwe-popups.flipped_y:before{content:'';position:absolute;border:8px solid transparent;border-bottom:0;border-top: 8px solid #a2a9b1;bottom:-8px;left:10px}.mwe-popups.flipped_y:after{content:'';position:absolute;border:11px solid transparent;border-bottom:0;border-top:11px solid #fff;bottom:-7px;left:7px} .mwe-popups.mwe-popups-no-image-tri:before{content:'';position:absolute;border:8px solid transparent;border-top:0;border-bottom: 8px solid #a2a9b1;top:-8px;left:10px}.mwe-popups.mwe-popups-no-image-tri:after{content:'';position:absolute;border:11px solid transparent;border-top:0;border-bottom:11px solid #fff;top:-7px;left:7px} .audio{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAcUlEQVQ4y2P4//8/AyUYQhAH3gNxA7IAIQPmo/H3g/QA8XkgFiBkwHyoYnRQABVfj88AmGZcTuuHyjlgMwBZM7IE3NlQGhQe65EN+I8Dw8MLGgYoFpFqADK/YUAMwOsFigORatFIlYRElaRMWmaiBAMAp0n+3U0kqkAAAAAASUVORK5CYII=);background-position: center;background-repeat: no-repeat;cursor:pointer;margin-left: 8px;opacity: 0.5; width: 16px; display: inline-block;} .audio:hover {opacity: 1;}";
    shadow.appendChild(style);

    var encapsulateDiv = document.createElement("div");
    encapsulateDiv.style = "all: initial; text-shadow: transparent 0px 0px 0px, rgba(0,0,0,1) 0px 0px 0px !important;";
    shadow.appendChild(encapsulateDiv);


    var popupDiv = document.createElement("div");
    popupDiv.style = "font-family: arial,sans-serif; border-radius: 12px; border: 1px solid #a2a9b1; box-shadow: 0 0 17px rgba(0,0,0,0.5)";
    encapsulateDiv.appendChild(popupDiv);


    var contentContainer = document.createElement("div");
    contentContainer.className = "mwe-popups-container";
    popupDiv.appendChild(contentContainer);


    var content = document.createElement("div");
    content.className = "mwe-popups-extract";
    content.style = "line-height: 1.4; margin-top: 0px; margin-bottom: 11px; max-height: none";
    contentContainer.appendChild(content);


    var heading = document.createElement("h3");
    heading.id = HEADING_ID
    heading.style = "margin-block-end: 0px; display:inline-block;";
    heading.textContent = "Searching";

    var meaning = document.createElement("p");
    meaning.id = MEANING_ID
    meaning.style = "margin-top: 10px";
    meaning.textContent = "Please Wait...";

    var audio = document.createElement("div");
    audio.id = AUDIO_ID;
    audio.className = "audio";
    audio.innerHTML = "&nbsp;";
    audio.style.display = "none";

    var moreInfo = document.createElement("a");
    moreInfo.id = MORE_ID;
    moreInfo.href = `https://www.bing.com/dict/search?q=${encodeURIComponent(info.word)}`;
    moreInfo.style = "float: right; text-decoration: none;"
    moreInfo.target = "_blank";

    content.appendChild(heading);
    content.appendChild(audio);
    content.appendChild(meaning);
    content.appendChild(moreInfo);
    document.body.appendChild(hostDiv);

    if (info.clientY < window.innerHeight / 2) {
        popupDiv.className = "mwe-popups mwe-popups-no-image-tri mwe-popups-is-not-tall";
        hostDiv.style.top = info.bottom + 10 + "px";
        if (info.height == 0) {
            hostDiv.style.top = parseInt(hostDiv.style.top) + 8 + "px";
        }
    } else {
        popupDiv.className = "mwe-popups flipped_y mwe-popups-is-not-tall";
        hostDiv.style.top = info.top - 10 - popupDiv.clientHeight + "px";

        if (info.height == 0) {
            hostDiv.style.top = parseInt(hostDiv.style.top) - 8 + "px";
        }
    }
}

function appendToDiv(createdDiv, content) {
    var hostDiv = createdDiv.heading.getRootNode().host;
    var popupDiv = createdDiv.heading.getRootNode().querySelectorAll("div")[1];

    var heightBefore = popupDiv.clientHeight;
    createdDiv.heading.innerHTML = content.word + "<span style='font-weight: normal;color: #666666; margin-left: 10px'>" + content.phonetic + "</span>";
    createdDiv.meaning.innerText = content.lang_meanings.map(m=>{
        return m.pos.toLowerCase() + '：' + m.word
    }).join('\n');
    createdDiv.moreInfo.textContent = "More »";

    var heightAfter = popupDiv.clientHeight;
    var difference = heightAfter - heightBefore;


    if (popupDiv.classList.contains("flipped_y")) {
        hostDiv.style.top = parseInt(hostDiv.style.top) - difference + 1 + "px";
    }

    if (content.speech) {
        var sound = document.createElement("audio");
        sound.src = content.speech;
        createdDiv.audio.style.display = "inline-block";
        createdDiv.audio.addEventListener("click", function () {
            sound.play();
        });
    }
}

function getCreatedDiv() {
    const div = document.getElementById(POPUP_ID)
    if (!div) {
        return null;
    }
    const shadowRoot = div.shadowRoot;
    const heading = shadowRoot.querySelector(`#${HEADING_ID}`),
        meaning = shadowRoot.querySelector(`#${MEANING_ID}`),
        moreInfo = shadowRoot.querySelector(`#${MORE_ID}`),
        audio = shadowRoot.querySelector(`#${AUDIO_ID}`);
    return { heading, meaning, moreInfo, audio }
}

function noMeaningFound(createdDiv) {
    createdDiv.heading.textContent = "Sorry";
    createdDiv.meaning.textContent = "No definition found.";
}

function removeMeaning(event) {
    var element = event.target;
    if (!element.classList.contains("dictionaryDiv")) {
        document.getElementById(POPUP_ID) && document.getElementById(POPUP_ID).remove();
    }
}

function loading(event) {
    document.getElementById(POPUP_ID) && document.getElementById(POPUP_ID).remove();
    var info = getSelectionInfo(event)
    if (!info) return;
    if (!(new RegExp("[A-Za-z]+").test(info.word))) return;
    createDiv(info)
    return info
}

function showMeaning(content) {
    content && appendToDiv(getCreatedDiv(), content);
    content || noMeaningFound(getCreatedDiv())
}

export {
    loading,
    showMeaning,
    removeMeaning,
    restoreElementForXPath
}