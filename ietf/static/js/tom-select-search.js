// Copyright The IETF Trust 2025, All Rights Reserved
import TomSelect from 'tom-select'

const FIELD_SELECTOR = '.tom-select-field'
const PAGE_SIZE = 10
const FIRST_PAGE_NUMBER = 1

const initializeSelectSearch = (elt) => {
  let currentPage = FIRST_PAGE_NUMBER

  const buildUrl = (query, page) => {
    const url = new URL(elt.dataset.select2AjaxUrl, window.location)
    url.searchParams.set('q', query)
    url.searchParams.set('p', page.toString())
    return url
  }
  const settings = {
    create: false, // todo allow creation as an option
    createOnBlur: true,
    persist: false,
    maxItems: elt.dataset.maxEntries ?? null,
    maxOptions: 200,
    valueField: 'id',
    labelField: 'text',
    searchField: [], // external data source
    plugins: ['dropdown_input', 'virtual_scroll'],
    firstUrl: function (query) {
      currentPage = FIRST_PAGE_NUMBER
      return buildUrl(query, currentPage)
    },
    load: function (query, callback) {
      const url = this.getUrl(query)
      fetch(url)
        .then(response => response.json())
        .then(json => {
          // If we have not yet reached the end, prep next URL for virtual_scroll pagination.
          // Must do this before calling callback!
          if (json.length === PAGE_SIZE) {
            currentPage += 1
            this.setNextUrl(query, buildUrl(query, currentPage))
          }
          
          // Work around virtual_scroll glitch, thanks to
          // https://github.com/orchidjs/tom-select/issues/556#issuecomment-1919066054
          const _scrollToOption = this.scrollToOption
          this.scrollToOption = () => {}
          callback(json)
          this.scrollToOption = _scrollToOption
        })
        .catch(() => {callback()})
    },
    render: {
      item: function (data, escape) {
        // We trust the data from datatracker to be escaped in advance, but escape created data
        return `<div>${data.created ? escape(data.text) : data.text}</div>`
      },
      option: function (data, escape) {
        // We trust the data from datatracker to be escaped in advance, but escape created data
        return `<div>${data.created ? escape(data.text) : data.text}</div>`
      }
    }
  }
  new TomSelect(elt, settings)
}

// Set up when DOM is loaded
document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll(FIELD_SELECTOR).forEach((elt) => {
    initializeSelectSearch(elt)
  })
})
