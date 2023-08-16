<template>
  <div class="w-full h-full cursor-pointer">
    <header class="bg-gray-300 p-3 flex items-center justify-between fixed top-0 left-0 right-0 h-16">
      <!-- Logo and Title -->
      <div class="flex items-center">
        <img class="w-10 object-cover" src="../assets/logo.png" alt="">
        <h1 class=" font-serif ml-2 text-lg font-bold">Web Word Hunt</h1>
      </div>
      <!-- Setting Icon -->
      <!-- <div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
          class="mr-1 w-6 h-6 stroke-cyan-500 hover:stroke-cyan-700">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div> -->
    </header>
    <div class="absolute overflow-y-auto h-full top-16 left-0 right-0">
      <div class="overflow-y-auto w-full h-[calc(100%-4rem)]" id="accordionFlushExample">
        <div v-for="(f, idx) in folders"
          class="rounded-none border border-l-0 border-r-0 border-t-0 border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800">
          <h2 class="mb-0" :id="`flush-heading${idx}`">
            <button
              class="group relative flex w-full items-center rounded-none font-bold border-0 bg-white px-5 py-4 text-left text-base text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none dark:bg-neutral-800 dark:text-white [&:not([data-te-collapse-collapsed])]:bg-white [&:not([data-te-collapse-collapsed])]:text-primary [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(229,231,235)] dark:[&:not([data-te-collapse-collapsed])]:bg-neutral-800 dark:[&:not([data-te-collapse-collapsed])]:text-primary-400 dark:[&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]"
              type="button" data-te-collapse-init :data-te-target="`#flush-collapse${idx}`"
              :data-te-collapse-collapsed="idx > 0" aria-expanded="false" :aria-controls="`flush-collapse${idx}`">
              {{ f.host }}
              <span
                class="-mr-1 ml-auto h-5 w-5 shrink-0 rotate-[-180deg] fill-[#336dec] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:mr-0 group-[[data-te-collapse-collapsed]]:rotate-0 group-[[data-te-collapse-collapsed]]:fill-[#212529] motion-reduce:transition-none dark:fill-blue-300 dark:group-[[data-te-collapse-collapsed]]:fill-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </button>
          </h2>
          <div :id="`flush-collapse${idx}`" :class="getClassNames(idx)" data-te-collapse-item
            :data-te-collapse-show="idx == 0" :aria-labelledby="`flush-heading${idx}`"
            data-te-parent="#accordionFlushExample">
            <div v-for="(article, subidx) in f.list"
              class="select-none truncate pl-5 pr-2 py-2 group/item hover:bg-slate-100">
              <div class="flex flex-row justify-between">
                <span @click="showWordsPage(article)" class="grow overflow-hidden ml-2 mr-2 text-sm truncate text-gray-600">{{
                  article.title }}</span>
                <svg @click="openPage(article)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke-width="1" stroke="currentColor"
                  class="flex-none w-5 h-5 mr-2 group/edit invisible group-hover/item:visible hover:scale-125">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                </svg>
                <span @click="delPage(article, idx, subidx)"
                  class="flex-none align-middle mr-0 pl-2 pr-2 group/edit invisible whitespace-nowrap rounded-full text-sm text-orange-400 transition hover:bg-orange-400 hover:text-gray-800 group-hover/item:visible">delete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Words v-if="showWords" :article="selectedArticle" class="slide-in-enter-active absolute inset-0 bg-white"
        @close="showWords = false">
      </Words>
    </div>
  </div>
</template>

<script>
import { Collapse, initTE } from "tw-elements";
import Words from "./component/sidebar.vue"
import { extractHostFromURL } from "../common/tools"
const browser = require('../common/browser-polyfill')

export default {
  name: 'Popup',
  components: {
    Words
  },
  data() {
    return {
      folders: [],
      selectedArticle: {},
      showWords: false
    }
  },
  mounted() {
    let self = this
    browser.runtime.sendMessage({ action: 'get_pages' })
      .then((pages) => {
        const groupedByHost = Object.entries(pages).reduce((acc, [url, title]) => {
          const host = extractHostFromURL(url);
          if (acc[host]) {
            acc[host].push({ url, title });
          } else {
            acc[host] = [{ url, title }];
          }
          return acc;
        }, {});

        const hostList = Object.entries(groupedByHost).map(([host, list]) => {
          return { host, list };
        });
        hostList.sort((a, b) => a.host.localeCompare(b.host));

        self.folders = hostList
        console.log(hostList)
        setTimeout(() => {
          initTE({ Collapse }, true);
        }, 100)
      })
    setTimeout(() => {
      initTE({ Collapse }, true);
    }, 100)
  },
  methods: {
    getClassNames(index) {
      if (index === 0) {
        return {
          '!visible': true,
          'border-0': true,
        };
      } else if (index === this.folders.length - 1) {
        return {
          '!visible': true,
          'hidden': true,
        };
      } else {
        return {
          '!visible': true,
          'hidden': true,
          'border-0': true,
        };
      }
    },
    showWordsPage(article) {
      this.showWords = true
      this.selectedArticle = article
    },
    openPage(article) {
      browser.tabs.create({ url: article.url });
    },
    delPage(article, idx, subidx) {
      let self = this
      browser.runtime.sendMessage({ action: 'del_page', url: article.url })
        .then(() => {
          let subfolder = self.folders[idx]
          subfolder.list.splice(subidx, 1)
          if (subfolder.list.length == 0) {
            self.folders.splice(idx, 1)
          }
          self.$set(self, 'folders', self.folders)
        })
    }
  },
}

</script>

<style>
body {
  width: 350px;
  height: 500px;
}

.slide-in-enter-active {
  animation: slide-in 0.3s;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>
