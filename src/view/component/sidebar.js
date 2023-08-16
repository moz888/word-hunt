
import Vue from 'vue';
import Cards from './sidebar.vue'
import {restoreElementForXPath} from '../../common/meaning'

const sidebarId = 'dictionary_sidebar_id_9999';
const sidebarConstructor = Vue.extend(Cards);

class Sidebar {
    constructor() {
        this.sidebar = null
        this.visible = false
        let self = this
        this.sidebarFactory = function(params){
            return new Promise((resolve,reject) => {
                const ele = new sidebarConstructor({propsData:params}).$mount();
                ele.onDataLoaded = self.onSidebarLoaded;
                // ele.onClose = self.unsetup;
                ele.onClickWord = self.onClickWord;
                const sidebar = ele.$el;
                sidebar.id = sidebarId;
                sidebar.style.position = 'fixed';
                sidebar.style.top = '0';
                sidebar.style.right = '0';
                sidebar.style.width = '340px'; 
                sidebar.style.overflowY = 'auto';
                sidebar.style.zIndex = '999999';
                document.body.appendChild(ele.$el)
                ele.visible = self.visible;
                self.sidebar = ele
                resolve()
            })
        }
    }
    setup(cb){
        if(!this.sidebar){
            this.sidebarFactory({article:{ url: window.location.href, title: 'Vocabulary' }}).then(()=>{cb && cb()})
        }
    }
    unsetup(){
        if(!this.sidebar)return
        this.sidebar.$el.remove()
        this.sidebar = null
    }
    onSidebarLoaded(empty){
        this.visible = !empty
        if(this.sidebar) this.sidebar.visible = this.visible
    }
    addWord(word){
        this.sidebar && this.sidebar.addWord(word)
    }
    onClickWord(word){
        if(word && word.pos.xpath){
            const element = restoreElementForXPath(word.pos.xpath)
            element && element.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
        }
    }
    isEventTarget(target){
          const targetElement = target;
          const idToCheck = sidebarId;
          const targetHasId = targetElement.id === idToCheck;
  
          let isDescendantOfIdElement = false;
          let currentElement = targetElement;
          while (currentElement !== null) {
              if (currentElement.id === idToCheck) {
                  isDescendantOfIdElement = true;
                  break;
              }
              currentElement = currentElement.parentElement;
          }
          return (targetHasId || isDescendantOfIdElement)
    }
  }

  const sidebar = new Sidebar()

  export {
    sidebar
  }