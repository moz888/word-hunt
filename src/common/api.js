const browser = require('./browser-polyfill')

const LANGUAGE_MAP = {
    "Afrikaans": "af",
    "Arabic": "ar",
    "Bangla": "bn",
    "Bosnian (Latin)": "bs",
    "Bulgarian": "bg",
    "Catalan": "ca",
    "Chinese (Simplified)": "zh-CHS",
    "Croatian": "hr",
    "Czech": "cs",
    "Danish": "da",
    "Dutch": "nl",
    "Estonian": "et",
    "Faroese": "fo",
    "Finnish": "fi",
    "French": "fr",
    "German": "de",
    "Greek": "el",
    "Hebrew": "he",
    "Hindi": "hi",
    "Hungarian": "hu",
    "Icelandic": "is",
    "Indonesian": "id",
    "Italian": "it",
    "Japanese": "ja",
    "Kiswahili": "sw",
    "Korean": "ko",
    "Latvian": "lv",
    "Lithuanian": "lt",
    "Malay (Latin)": "ms",
    "Maltese": "mt",
    "Norwegian Bokmål": "nb",
    "Persian": "fa",
    "Polish": "pl",
    "Portuguese": "pt",
    "Romanian": "ro",
    "Russian": "ru",
    "Serbian (Cyrillic)": "sr",
    "Slovak": "sk",
    "Slovenian": "sl",
    "Spanish": "es",
    "Swedish": "sv",
    "Tamil": "ta",
    "Thai": "th",
    "Turkish": "tr",
    "Ukrainian": "uk",
    "Urdu": "ur",
    "Vietnamese": "vi",
    "Welsh": "cy"
}

const TranslateApi = function () {
    this.source = 'bing.com'
    this.speech_url_prefix = 'https://cn.bing.com'
    this.url_prefix = 'https://cn.bing.com/search?FORM=DCTRQY&q=define+'
}

TranslateApi.prototype.tranlate = async function (word, language, include) {

    if (!word) return
    if (!(new RegExp("[A-Za-z]+").test(word))) return;

    try {
        var { html, context } = await browser.runtime.sendMessage({ action: 'fetch', context: { word, language, include } })
        if (!html) return;

        var body = new DOMParser().parseFromString(html, 'text/html');

        var container_ele = body.getElementById('b_dict_container');

        var heading = container_ele.querySelector("[role='heading']").textContent,
            phonetic = container_ele.querySelector('.b_hPanel').querySelector('span').textContent,
            audio = container_ele.querySelector("audio").getAttribute('src').replace('&pid=Dictionary', '')
        var speech_url = `${this.speech_url_prefix}${audio}`

        var pds = Array.from(container_ele.querySelector('.dc_pds').querySelectorAll('.dc_pd'))
            .map((pd => {
                var partOfSpeech = pd.querySelector('.b_hPanel').querySelectorAll('span')[0].textContent
                var definitions = Array.from(pd.querySelector('.b_dList').querySelectorAll('.dc_nml')).map(dc_nml => {
                    var definition = dc_nml.querySelector('.dc_pm').querySelector('.dc_mn').textContent
                    var similars = []
                    if (dc_nml.querySelector('.dc_pm').querySelector('.b_factrow')) {
                        similars = Array.from(dc_nml.querySelector('.dc_pm').querySelector('.b_factrow').querySelectorAll('.b_nymsItem'))
                            .filter(item => item.querySelector('a'))
                            .map(item => item.textContent)
                    }
                    return { definition, similars }
                })
                return { pos: partOfSpeech, definitions: definitions }
            }))

        var hiddenData = JSON.parse(body.getElementById('hidden_data').innerHTML),
            translateMap = hiddenData.map((t) => {
                return {
                    lang: t.language, Content: t.Content.map((c) => {
                        return { pos: c.pos, word: c.word }
                    })
                }
            }).reduce((dict, item) => {
                dict[item.lang] = item.Content;
                return dict;
            }, {}),
            lang_meanings = language ? translateMap[language] : [];
        const result = lang_meanings.reduce((acc, obj) => {
            var existingObj = acc.find(item => item.pos === obj.pos);
            if (existingObj) {
                existingObj.word += `，${obj.word}`;
            } else {
                acc.push(obj);
            }
            return acc;
        }, []);

        return {
            word,
            heading,
            phonetic,
            speech: speech_url,
            meanings: pds,
            lang_meanings: result,
            ...include
        }
    } catch (err) { return }
}

const translate = new TranslateApi()

module.exports = translate