class Patch {
  constructor(
    patchInput = "",
    grammar = {
      rowDelimiter: "&",
      columnDelimiter: "=",
      encodedRowDelimiter: "%2E%2E%2E",
      encodedColumnDelimiter: "%7E"
    }
  ) {
    // The pipeline of encodings. Operations will be run in order for encoding (and reveresed for decoding).
    this.encoders = [
      {
        encode: str => encodeURIComponent(str),
        decode: str => decodeURIComponent(str)
      },
      {
        encode: str => this.replaceAll(str, this.grammar.columnDelimiter, this.grammar.encodedColumnDelimiter),
        decode: str => this.replaceAll(str, this.grammar.encodedColumnDelimiter, this.grammar.columnDelimiter)
      },
      {
        encode: str => this.replaceAll(str, this.grammar.rowDelimiter, this.grammar.encodedRowDelimiter),
        decode: str => this.replaceAll(str, this.grammar.encodedRowDelimiter, this.grammar.rowDelimiter)
      },
      {
        // Turn "%20" into "+" for prettier urls.
        encode: str => str.replace(/\%20/g, "+"),
        decode: str => str.replace(/\+/g, "%20")
      }
    ]
    this.grammar = grammar
    if (typeof patchInput === "string") this.uriEncodedString = patchInput
    else if (Array.isArray(patchInput)) this.uriEncodedString = this.arrayToEncodedString(patchInput)
    else this.uriEncodedString = this.objectToEncodedString(patchInput)
  }
  replaceAll(str, search, replace) {
    return str.split(search).join(replace)
  }
  objectToEncodedString(obj) {
    return Object.keys(obj)
      .map(identifierCell => {
        const value = obj[identifierCell]
        const valueCells = value instanceof Array ? value : [value]
        const row = [identifierCell, ...valueCells].map(cell => this.encodeCell(cell))
        return row.join(this.grammar.columnDelimiter)
      })
      .join(this.grammar.rowDelimiter)
  }
  arrayToEncodedString(arr) {
    return arr.map(line => line.map(cell => this.encodeCell(cell)).join(this.grammar.columnDelimiter)).join(this.grammar.rowDelimiter)
  }
  get array() {
    return this.uriEncodedString.split(this.grammar.rowDelimiter).map(line => line.split(this.grammar.columnDelimiter).map(cell => this.decodeCell(cell)))
  }
  get object() {
    const patchObj = {}
    if (!this.uriEncodedString) return patchObj
    this.array.forEach(cells => {
      const identifierCell = cells.shift()
      patchObj[identifierCell] = cells.length > 1 ? cells : cells[0] // If a single value, collapse to a simple tuple. todo: sure about this design?
    })
    return patchObj
  }
  encodeCell(unencodedCell) {
    return this.encoders.reduce((str, encoder) => encoder.encode(str), unencodedCell)
  }
  decodeCell(encodedCell) {
    return this.encoders
      .slice()
      .reverse()
      .reduce((str, encoder) => encoder.decode(str), encodedCell)
  }
}

class TableSearchApp {
  constructor() {
    this.processTableHeaders()
    this.createDatatable()
    this.bindToHashChange()
  }

  get windowHash() {
    return window.location.hash.replace(/^#/, "")
  }

  get objectFromHash() {
    return new Patch(this.windowHash).object
  }

  setObjectOnHash(obj) {
    if (obj.order === "0.asc") delete obj.order
    Object.keys(obj).forEach(key => {
      if (obj[key] === "") delete obj[key]
    })
    const newHash = new Patch(obj).uriEncodedString
    if (this.windowHash !== newHash) window.location.hash = newHash
  }

  processTableHeaders() {
    // Store date column information
    this.dateColumns = new Map()

    // Process table headers
    const table = document.querySelector("table.scrollTable")
    const headers = table.querySelectorAll("th")

    headers.forEach((header, index) => {
      const originalText = header.textContent
      if (originalText.startsWith("last")) {
        // Store the column index and the new name (without 'last')
        const newName = originalText.slice(4) // Remove 'last' prefix
        this.dateColumns.set(index, newName)
        header.textContent = newName
      }
    })
  }

  createColumnDefs() {
    const columnDefs = []
    this.dateColumns.forEach((newName, index) => {
      columnDefs.push({
        targets: index,
        render: (data, type) => {
          if (type === "display") {
            // Parse the date and return relative time
            const timestamp = /^\d+$/.test(data) ? (String(data).length < 9 ? parseInt(data) * 1000 : parseInt(data)) : data
            const date = dayjs(timestamp)
            if (date.isValid()) {
              return `<span title="${date.toLocaleString()}">${date.fromNow()}</span>`
            }
          }
          // Return original data for sorting/filtering
          return data
        }
      })
    })
    return columnDefs
  }

  bindToHashChange() {
    window.addEventListener("hashchange", () => {
      this.dataTables.search(this.searchFromHash).order(this.orderFromHash).draw(false)
    })
  }

  createDatatable() {
    this.dataTables = jQuery("table.scrollTable").DataTable({
      paging: false,
      stateSave: true,
      columnDefs: this.createColumnDefs(),
      stateSaveCallback: (settings, data) => {
        const order = data.order.map(([column, direction]) => `${column}.${direction}`).join(this.columnDelimiter)
        const patch = {
          q: data.search.search,
          order
        }
        this.setObjectOnHash(patch)
      },
      layout: {
        topStart: {
          buttons: ["copy"]
        },
        topEnd: {
          search: {
            placeholder: "Search"
          }
        }
      },
      search: { search: this.searchFromHash },
      order: this.orderFromHash,
      stateLoadCallback: settings => {
        return {
          search: {
            order: this.orderFromHash,
            search: this.searchFromHash
          }
        }
      }
    })
    this.addExpandButtons()
  }

  addExpandButtons() {
    let buttons = document.querySelectorAll(".buttons-copy")

    buttons.forEach(button => {
      let ariaControls = button.getAttribute("aria-controls")
      let newHTML = `<button id="expandToggle${ariaControls}" aria-controls="${ariaControls}" class="dt-button buttons-html5 expandCollapseButton" tabindex="1" type="button"><span>Expand</span></button>`

      button.insertAdjacentHTML("afterend", newHTML)

      let newButton = document.getElementById(`expandToggle${ariaControls}`)

      newButton.onclick = function () {
        this.innerHTML = this.innerHTML.includes("Expand") ? "Collapse" : "Expand"
        document.querySelector("#" + ariaControls).classList.toggle("expandedTable")
      }
    })
  }

  get orderFromHash() {
    const order = this.objectFromHash.order
    return order
      ? order.split(this.columnDelimiter).map(o => {
          const parts = o.split(".")
          return [parseInt(parts[0]), parts[1]]
        })
      : []
  }

  columnDelimiter = "~"

  get searchFromHash() {
    return this.objectFromHash.q || ""
  }
}

document.addEventListener("DOMContentLoaded", () => (window.tableSearchApp = new TableSearchApp()))
