const AppConstants = {"grammar":"tooling\n Related work\n CSS is great for text selector ideas: https://www.w3schools.com/cssref/css_selectors.asp\n Roff has a lot of related markup ideas: https://www.systutorials.com/docs/linux/man/7-groff_man/\nanyCell\nurlCell\n highlightScope constant.language\nkeywordCell\n highlightScope keyword\nstringCell\n highlightScope string\nidCell\n highlightScope constant.language\ndateCell\n highlightScope string\nintegerCell\n highlightScope constant.numeric\npermalinkCell\n highlightScope string\ncommentCell\n highlightScope comment\nblankCell\npersonNameCell\n extends stringCell\ncodeCell\n highlightScope comment\nbulletPointCell\n description Any token used as a bullet point such as \"-\" or \"1.\" or \">\"\n highlightScope keyword\nemailAddressCell\n extends stringCell\ntagOrUrlCell\n description An HTML tag or a url.\n highlightScope constant.language\ndelimiterCell\n description String to use as a delimiter.\n highlightScope string\nhtmlAttributesCell\n highlightScope comment\nclassNameCell\n highlightScope constant\nhtmlIdCell\n extends idCell\nfilePathCell\n extends stringCell\ngroupNameCell\n extends stringCell\ntemplateEnumCell\n enum group snippets file blank\n extends stringCell\naftertextTextNode\n catchAllCellType stringCell\n boolean isTextNode true\nabstractScrollNode\n cells keywordCell\nabstractAftertextNode\n description Text followed by markup commands.\n extends abstractScrollNode\n catchAllNodeType aftertextTextNode\n inScope abstractAftertextDirectiveNode abstractAftertextAttributeNode\n example\n  aftertext\n   Hello brave new world\n   link home.com new\n   bold brave new\n   underline new world\n   strikethrough wor\n javascript\n  get markupInserts() {\n   const { originalTextPostLinkify } = this\n   return this.filter(node => node.isMarkupNode)\n    .map(node => node.getInserts(originalTextPostLinkify))\n    .filter(i => i)\n    .flat()\n  }\n  get originalTextPostLinkify() {\n    const originalText = this.filter(node => node.isTextNode)\n    .map(node => node.toString())\n    .join(\"\\n\")\n    const shouldLinkify = originalText.includes(\"<a \") ? false : true\n    return shouldLinkify ? jtree.Utils.linkify(originalText) : originalText\n  }\n  get text() {\n   const { originalTextPostLinkify, markupInserts } = this\n   let adjustment = 0\n   let newText = originalTextPostLinkify\n   // If multiple tags start at same index, the tag that closes first should start last. Otherwise HTML breaks.\n   markupInserts.sort((a, b) => (a.index === b.index ? b.endIndex - a.endIndex : a.index - b.index))\n   markupInserts.forEach(insertion => {\n    insertion.index += adjustment\n    const consumeStartCharacters = insertion.consumeStartCharacters ?? 0\n    const consumeEndCharacters = insertion.consumeEndCharacters ?? 0\n    newText = newText.slice(0, insertion.index - consumeEndCharacters) + insertion.string + newText.slice(insertion.index + consumeStartCharacters)\n    adjustment += insertion.string.length - consumeEndCharacters - consumeStartCharacters\n   })\n   return newText\n  }\n  tag = \"p\"\n  className = \"scrollParagraphComponent\"\n  compile() {\n   return `<${this.tag} ${this.divAttributes}class=\"${this.className}\">${this.text}</${this.tag}>`\n  }\n  get divAttributes() {\n   const attrs = this.filter(node => node.isAttributeNode)\n   return attrs.length ? attrs.map(node => node.divAttributes).join(\" \") + \" \" : \"\"\n  }\nthoughtNode\n todo Perhaps rewrite this from scratch and move out of aftertext.\n extends abstractAftertextNode\n catchAllCellType stringCell\n example\n  * I had a _new_ thought.\n description A thought.\n crux *\n javascript\n  compile() {\n   // Hacky, I know.\n   const newLine = this.prependLine(this.getContent())\n   const newLine2 = this.appendLine(\"wrapsOn\")\n   const compiled = super.compile()\n   newLine.destroy()\n   newLine2.destroy()\n   return compiled\n  }\nlistAftertextNode\n extends thoughtNode\n example\n  - I had a _new_ thought.\n description A list item.\n crux -\n javascript\n  compile() {\n   const index = this.getIndex()\n   const parent = this.getParent()\n   const isStartOfList =\n    index === 0 ||\n    !parent\n     .nodeAt(index - 1)\n     .getLine()\n     .startsWith(\"- \")\n   const isEndOfList =\n    parent.length === index + 1 ||\n    !parent\n     .nodeAt(index + 1)\n     .getLine()\n     .startsWith(\"- \")\n   const { listType } = this\n   return (isStartOfList ? `<${listType}>` : \"\") + `${super.compile()}` + (isEndOfList ? `</${listType}>` : \"\")\n  }\n  tag = \"li\"\n  get listType() {\n   return \"ul\" // todo: in the future add support for ol\n  }\nquestionAftertextNode\n description A question.\n extends thoughtNode\n crux ?\n javascript\n  tag = \"h4\"\n  className = \"scrollQuestionComponent\"\nh3AftertextNode\n description Compiles to an h3 tag.\n extends thoughtNode\n crux #\n javascript\n  tag = \"h3\"\n  className = \"scrollSectionComponent\"\nh4AftertextNode\n extends h3AftertextNode\n crux ##\n javascript\n  tag = \"h4\"\nblinkNode\n description Useful when you have a client that always needs to find 1 thing they would like you to change.\n extends thoughtNode\n crux blink\n javascript\n  compile() {\n   return `<span class=\"scrollBlink\">${super.compile()}</span>\n    <script>\n    setInterval(()=>{\n        Array.from(document.getElementsByClassName(\"scrollBlink\")).forEach(el => \n        el.style.color = el.style.color === \"white\" ? \"black\" : \"white\"\n        )\n    }, 2000)\n    </script>`\n  }\nimageCaptionAftertextNode\n description An optional caption to accompany the image.\n crux caption\n extends thoughtNode\nloremIpsumNode\n extends abstractAftertextNode\n description Generate dummy text.\n cruxFromId\n catchAllCellType integerCell\n javascript\n  get originalTextPostLinkify() {\n   return `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`\n  }\n  compile() {\n   return super.compile().repeat(this.getWord(1) ? parseInt(this.getWord(1)) : 1)\n  }\nabstractTopLevelSingleMetaNode\n description Use these keywords once per file.\n extends abstractScrollNode\n cruxFromId\n cells keywordCell\n javascript\n  compile() { return \"\"}\npermalinkNode\n description When compiling, Scroll will save this file to {permalink}\n extends abstractTopLevelSingleMetaNode\n cells keywordCell permalinkCell\ngroupsNode\n description Add this file to zero or more groups.\n cruxFromId\n example\n  groups index.html\n extends abstractTopLevelSingleMetaNode\n cells keywordCell\n catchAllCellType permalinkCell\ntitleNode\n catchAllCellType stringCell\n description Title of the page.\n extends abstractTopLevelSingleMetaNode\n inScope hiddenTitleNode\n javascript\n  compile() {\n   return this.has(\"hidden\") ? \"\" : `<h1 class=\"scrollTitleComponent\"><a href=\"${this.getRootNode().permalink}\">${this.getContent()}</a></h1>`\n  }\ndescriptionNode\n catchAllCellType stringCell\n description Description for Open Graph. https://ogp.me/. If not defined, Scroll will try to generate it's own.\n extends abstractTopLevelSingleMetaNode\nviewSourceUrlNode\n catchAllCellType urlCell\n description Use this to override the link to the source code for a scroll file.\n extends abstractTopLevelSingleMetaNode\ndateNode\n catchAllCellType dateCell\n description Date this file was first published.\n extends abstractTopLevelSingleMetaNode\nendSnippetNode\n description Insert one of these where you want to cut the file for a snippet.\n extends abstractTopLevelSingleMetaNode\nabstractSiteSettingNode\n extends abstractScrollNode\n cells keywordCell\n javascript\n  compile() {\n    return \"\"\n  }\nabstractUrlSettingNode\n extends abstractSiteSettingNode\n cells keywordCell urlCell\n cruxFromId\nopenGraphImageNode\n description URL for Open Graph Image. https://ogp.me/. If not defined, Scroll will try to generate it's own using the first image tag on your page.\n extends abstractUrlSettingNode\nrssFeedUrlNode\n description URL for RSS feed, if any.\n extends abstractUrlSettingNode\nbaseUrlNode\n description Root url of the published site on the web. Must be provided for RSS Feeds and OpenGraph tags to work, but has no effect locally.\n extends abstractUrlSettingNode\nviewSourceBaseUrlNode\n description The base link to be used to generate the \"View source\" link.\n extends abstractUrlSettingNode\ngithubNode\n description A link to the GitHub project or profile page.\n extends abstractUrlSettingNode\ntwitterNode\n description A link to the blog or author's Twitter account.\n extends abstractUrlSettingNode\nabstractIntSettingNode\n cruxFromId\n extends abstractSiteSettingNode\n cells keywordCell integerCell\nmaxColumnsNode\n extends abstractIntSettingNode\n description Set your own max column count for a single file's generated HTML.\ncolumnWidthNode\n extends abstractIntSettingNode\n description Set your own column width, in ch units, for the generated HTML.\nscrollCssNode\n extends abstractSiteSettingNode\n cruxFromId\n cells keywordCell permalinkCell\n description If not present Scroll style CSS will be included on each page.\nscrollHeaderNode\n extends abstractSiteSettingNode\n description Define a header for a certain page. Setting to blank will also remove the header on a page.\n cruxFromId\n catchAllNodeType stumpNode\n javascript\n  compile() { return \"\"}\nscrollFooterNode\n extends abstractSiteSettingNode\n description Define a footer for a certain page. Setting to blank will also remove the footer on a page.\n cruxFromId\n catchAllNodeType stumpNode\n javascript\n  compile() { return \"\"}\nabstractSiteStringSettingNode\n extends abstractSiteSettingNode\n catchAllCellType stringCell\n cruxFromId\nemailNode\n description Email address for the site owner.\n extends abstractSiteSettingNode\n cruxFromId\n cells keywordCell emailAddressCell\nauthorNode\n description Prints an author byline with an optional link to a page for the author.\n extends abstractScrollNode\n cruxFromId\n cells keywordCell urlCell\n catchAllCellType personNameCell\n example\n  comment With Link:\n  author https://breckyunits.com Breck Yunits\n  comment No link:\n  author  Breck Yunits\n javascript\n  compile() {\n   const link = this.getWord(1)\n   return `<div class=\"scrollAuthor\">by <a ${link ? `href=\"${link}\"` : \"\"}>${this.getWordsFrom(2).join(\" \")}</a></div>`\n  }\nchatNode\n description A dialogue between two people.\n catchAllNodeType chatLineNode\n cruxFromId\n extends abstractScrollNode\n javascript\n  compile() {\n   return this.map((line, index) => `<div class=\"scrollDialogueComponent ${index % 2 ? \"scrollDialogueComponentRight\" : \"scrollDialogueComponentLeft\"}\"><span>${line.toString()}</span></div>`).join(\"\")\n  }\ncodeNode\n description A code block.\n catchAllNodeType lineOfCodeNode\n extends abstractScrollNode\n javascript\n  compile() {\n   return `<code class=\"scrollCodeBlockComponent\">${this.childrenToString().replace(/\\</g, \"&lt;\")}</code>`\n  }\n cruxFromId\ncodeWithLanguageNode\n description Use this to specify the language of the code block, such as csvCode or rustCode.\n extends codeNode\n pattern ^[a-zA-Z0-9_]+Code$\nbelowAsCodeNode\n description Print the Scroll code of the next node.\n extends abstractScrollNode\n cruxFromId\n javascript\n  get target() { return this.getNext()}\n  compile() {\n   return `<code class=\"scrollCodeBlockComponent\">${this.target.toString().replace(/\\</g, \"&lt;\")}</code>`\n  }\naboveAsCodeNode\n description Print the Scroll code for the previous node.\n extends belowAsCodeNode\n javascript\n  get target() { return this.getPrevious()}\ncommentNode\n description Will not appear in the compiled HTML.\n catchAllCellType commentCell\n extends abstractScrollNode\n cruxFromId\n javascript\n  compile() {\n   return ``\n  }\n catchAllNodeType commentLineNode\ncssNode\n extends abstractScrollNode\n description Prints CSS content wrapped in a style tag.\n cruxFromId\n catchAllNodeType cssLineNode\n javascript\n  compile() {\n   return `<style>${this.childrenToString()}</style>`\n  }\nscrollNodeTypeDefinitionNode\n extends abstractScrollNode\n todo Figure out best pattern for integrating Scroll and Grammar?\n pattern ^[a-zA-Z0-9_]+Node$\n description Define your own nodeTypes in the Grammar language for using in your Scroll files.\n baseNodeType blobNode\n javascript\n  compile() {\n    return \"\"\n  }\nhtmlNode\n description A catch all block to drop in any loose html.\n cruxFromId\n extends abstractScrollNode\n catchAllNodeType htmlLineNode\n javascript\n  compile() {\n   return `${this.childrenToString()}`\n  }\nimageNode\n description An img tag.\n cells keywordCell urlCell\n extends abstractScrollNode\n cruxFromId\n inScope imageCaptionAftertextNode\n javascript\n  compile() {\n   const file = this.getRootNode().file\n   const folder = file.folder.folder\n   const src = this.getWord(1)\n   let imgTag = \"\"\n   try {\n    const sizeOf = require(\"image-size\")\n    const path = require(\"path\")\n    const dimensions = sizeOf(path.join(folder, src))\n    const width = dimensions.width\n    const height = dimensions.height\n    imgTag = `<img src=\"${src}\" width=\"${width}\" height=\"${height}\" loading=\"lazy\"/>`\n   } catch (err) {\n    console.error(err)\n    imgTag = `<img src=\"${src}\">`\n   }\n    const caption = this.getNode(\"caption\")\n    const captionFig = caption  ? `<figcaption>${caption.compile()}</figcaption>` : \"\"\n    return `<figure class=\"scrollImageComponent\"><a href=\"${src}\" target=\"_blank\">${imgTag}</a>${captionFig}</figure>`\n  }\nimportNode\n description Import one file into another.\n cruxFromId\n extends abstractScrollNode\n catchAllCellType filePathCell\n javascript\n  compile() { return \"\"}\n example\n  import settings.scroll\nimportOnlyNode\n description Mark a file as not one to build. This line will be not be imported into the importing file.\n cruxFromId\n extends abstractScrollNode\n javascript\n  compile() { return \"\"}\nkeyboardNavNode\n description Makes left go to previous file and right go to next file.\n extends abstractScrollNode\n cruxFromId\n catchAllCellType urlCell\n javascript\n  compile() {\n   const file = this.getRootNode().file\n   const linkToPrevious = this.getWord(1) ?? file.linkToPrevious\n   const linkToNext = this.getWord(2) ?? file.linkToNext\n   const script = `<script>document.addEventListener('keydown', function(event) {\n    if (document.activeElement !== document.body) return\n    const getLinks = () => document.getElementsByClassName(\"scrollKeyboardNav\")[0].getElementsByTagName(\"a\")\n    if (event.key === \"ArrowLeft\")\n      getLinks()[0].click()\n    else if (event.key === \"ArrowRight\")\n      getLinks()[1].click()\n   });</script>`\n   return `<div class=\"scrollKeyboardNav\"><a href=\"${linkToPrevious}\">${linkToPrevious}</a> · ${file.permalink} · <a href=\"${linkToNext}\">${linkToNext}</a>${script}</div>`\n  }\ntemplateNode\n extends abstractScrollNode\n cruxFromId\n cells keywordCell templateEnumCell\n catchAllCellType stringCell\n description Defaults to \"file\".\n javascript\n  compile() {\n    return \"\"\n  }\nquoteNode\n cruxFromId\n description A blockquote.\n catchAllNodeType quoteLineNode\n extends abstractScrollNode\n javascript\n  compile() {\n   return `<blockquote class=\"scrollQuoteComponent\">${this.childrenToString()}</blockquote>`\n  }\nreadingListNode\n extends abstractScrollNode\n description Easily create a reading list with links, titles, and author names.\n cells keywordCell\n cruxFromId\n catchAllNodeType readingListItemNode\n example\n  readingList\n   https://example.com/similar by Author Name\n javascript\n  compile() {\n    return `<br><ul>${this.map(child => child.compile()).join(\"\\n\")}</ul>`\n  }\nredirectToNode\n description Prints an HTML redirect tag. In the future might also emit nginx config.\n extends abstractScrollNode\n cruxFromId\n example\n  redirectTo https://scroll.pub/releaseNotes.html\n javascript\n  compile() {\n   return `<meta http-equiv=\"Refresh\" content=\"0; url='${this.getWord(1)}'\" />`\n  }\nreplaceNode\n description Define a variable token and replacement that will be applied to all lines following this one.\n extends abstractScrollNode\n cruxFromId\n catchAllCellType stringCell\n baseNodeType blobNode\n example\n  replace YEAR 2022\n javascript\n  compile() {\n   return \"\"\n  }\nreplaceDefaultNode\n description Define the default value for a replacement. Useful if you want to import a file and set a replacement later.\n extends abstractScrollNode\n catchAllCellType stringCell\n baseNodeType blobNode\n example\n  replaceDefault YEAR 2021\n cruxFromId\n javascript\n  compile() {\n   return \"\"\n  }\nprintFeedNode\n description Prints out the RSS feed for a group.\n extends abstractScrollNode\n cruxFromId\n cells keywordCell groupNameCell\n javascript\n  compile() {\n  const file = this.getRootNode().file\n  const folder = file.folder\n  const files = folder.getGroup(this.getWord(1))\n  const { title, baseUrl, description } = file\n        return `<?xml version=\"1.0\" encoding=\"ISO-8859-1\" ?>\n  <rss version=\"0.91\">\n  <channel>\n   <title>${title}</title>\n   <link>${baseUrl}</link>\n   <description>${description}</description>\n   <language>en-us</language>\n  ${files.map(file => file.toRss()).join(\"\\n\")}\n  </channel>\n  </rss>`\n  }\nprintScrollCSSNode\n description Prints out the default Scroll theme CSS.\n extends abstractScrollNode\n cruxFromId\n javascript\n  compile() {\n   return this.getRootNode().file.SCROLL_CSS\n  }\nabstractTableNode\n cruxFromId\n catchAllNodeType rowNode\n extends abstractScrollNode\n javascript\n  get tableHeader() {\n   return this.columns.filter(col => !col.isLink).map(column => `<th>${column.name}</th>\\n`)\n  }\n  get columnNames() {\n    const header = this.nodeAt(0)\n    return header\n    ? header\n      .getLine()\n      .split(this.delimiter)\n    : []  \n  }\n  get columns() {\n    const cols = this.columnNames\n    return cols.map((name, index) => {\n      const isLink = name.endsWith(\"Link\")\n      const linkIndex = cols.indexOf(name + \"Link\")\n      return {\n        name,\n        isLink,\n        linkIndex\n      }\n    })\n  }\n  get tableBody() {\n   const {delimiter} = this\n   return this.getTopDownArray()\n    .slice(1)\n    .map(node => `<tr>${node.toRow(this.columns, delimiter)}</tr>`)\n    .join(\"\\n\")\n  }\n  compile() {\n   return `<table class=\"scrollTableComponent\"><thead><tr>${this.tableHeader.join(\"\\n\")}</tr></thead>\\n<tbody>${this.tableBody}</tbody></table>`\n  }\ncommaTableNode\n description Comma separated values table.\n extends abstractTableNode\n string delimiter ,\npipeTableNode\n description Pipe separated values table.\n extends abstractTableNode\n string delimiter |\nspaceTableNode\n description Space separated values table. Last column is a catch all.\n extends abstractTableNode\n string delimiter  \ntabTableNode\n description Tab separated values table.\n extends abstractTableNode\n string delimiter \\t\ntreeTableNode\n description A table of data written in Tree Notation form. Useful when a column contains a text blob.\n extends abstractTableNode\n catchAllNodeType treeRowNode\n javascript\n  get columnNames() {\n    return this._getUnionNames()\n  }\n  get tableBody() {\n   return this\n    .map(node => `<tr>${node.toRow(this.columns)}</tr>`)\n    .join(\"\\n\")\n  }\n example\n  treeTable\n   row\n    name Javascript\n    example\n     console.log(\"Hello world\")\n   row\n    name Python\n    example\n     print \"Hello world\"\nkpiTableNode\n description Display key statistics in a big font.\n catchAllNodeType rowNode\n cruxFromId\n extends abstractScrollNode\n example\n  kpiTable\n   #2 Popularity\n   30 Years Old\n   $456 Revenue\n javascript\n  get tableBody() {\n   const items = this.getTopDownArray()\n   let str = \"\"\n   for (let i = 0; i < items.length; i = i + 3) {\n      str += this.makeRow(items.slice(i, i + 3))\n   }\n   return str\n  }\n  makeRow(items) {\n    return `<tr>` + items.map(node => `<td>${node.getWord(0)}<span>${node.getContent()}</span></td>`)\n    .join(\"\\n\") + `</tr>\\n`\n  }\n  compile() {\n   return `<table class=\"scrollKpiTable\">${this.tableBody}</table>`\n  }\nabstractAftertextAttributeNode\n cells keywordCell\n boolean isAttributeNode true\n javascript\n  get divAttributes() {\n   return `${this.getWord(0)}=\"${this.getContent()}\"`\n  }\n  compile() {\n   return \"\"\n  }\naftertextIdNode\n crux id\n description Provide an ID to be output in the generated HTML paragraph.\n extends abstractAftertextAttributeNode\n cells keywordCell htmlIdCell\n single\nabstractAftertextDirectiveNode\n cells keywordCell\n catchAllCellType stringCell\n javascript\n  isMarkupNode = true\n  get pattern() {\n   return this.getWordsFrom(1).join(\" \")\n  }\n  get shouldMatchAll() {\n   return this.has(\"matchAll\")\n  }\n  getMatches(text) {\n   const { pattern } = this\n   const escapedPattern = pattern.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, \"\\\\$&\")\n   return [...text.matchAll(new RegExp(escapedPattern, \"g\"))].map(match => {\n    const { index } = match\n    const endIndex = index + pattern.length\n    return [{ index, string: `<${this.openTag}${this.allAttributes}>`, endIndex }, { index: endIndex, endIndex, string: `</${this.closeTag}>` }]\n   })\n  }\n  getInserts(text) {\n   const matches = this.getMatches(text)\n   if (!matches.length) return false\n   if (this.shouldMatchAll) return matches.flat()\n   const indexNode = this.getNode(\"match\")\n   if (indexNode)\n    return indexNode.indexes\n     .map(index => matches[index])\n     .filter(i => i)\n     .flat()\n   return matches[0]\n  }\n  get allAttributes() {\n   const attr = this.attributes.join(\" \")\n   return attr ? \" \" + attr : \"\"\n  }\n  get attributes() {\n   return []\n  }\n  get openTag() {\n   return this.tag\n  }\n  get closeTag() {\n   return this.tag\n  }\nabstractMarkupNode\n extends abstractAftertextDirectiveNode\n inScope abstractMarkupParameterNode\nboldNode\n cruxFromId\n extends abstractMarkupNode\n javascript\n  tag = \"b\"\nitalicsNode\n cruxFromId\n extends abstractMarkupNode\n javascript\n  tag = \"i\"\nunderlineNode\n cruxFromId\n extends abstractMarkupNode\n javascript\n  tag = \"u\"\naftertextCodeNode\n crux code\n extends abstractMarkupNode\n javascript\n  tag = \"code\"\nlinkNode\n extends abstractMarkupNode\n cells keywordCell urlCell\n inScope linkNoteNode\n cruxFromId\n javascript\n  tag = \"a\"\n  get link() {\n   return this.getWord(1)\n  }\n  get attributes() {\n   const attrs = [`href=\"${this.link}\"`]\n   const title = this.getNode(\"note\")\n   if (title) attrs.push(`title=\"${title.childrenToString().replace(/\\n/g, \" \")}\"`)\n   return attrs\n  }\n  patternStartsAtWord = 2\n  get pattern() {\n   // If no pattern is provided, make the *entire* line a link.\n   const words = this.getWordsFrom(this.patternStartsAtWord)\n   return words.length ? words.join(\" \") : this.getParent().getContent()\n  }\nemailLinkNode\n description A mailto link\n crux email\n extends linkNode\n javascript\n  get attributes() {\n   return [`href=\"mailto:${this.link}\"`]\n  }\nquickLinkNode\n pattern ^https?\\:\n extends linkNode\n cells urlCell\n javascript\n  get link() {\n   return this.getWord(0)\n  }\n  patternStartsAtWord = 1\nclassMarkupNode\n description Add a span with a class name around matching text.\n extends abstractMarkupNode\n cells keywordCell classNameCell\n crux class\n javascript\n  tag = \"span\"\n  get className() {\n   return this.getWord(1)\n  }\n  get attributes() {\n   return [`class=\"${this.className}\"`]\n  }\n  get pattern() {\n   return this.getWordsFrom(2).join(\" \")\n  }\ncaveatNode\n description Add a caveat viewable on hover on matching text. When you want to be sure you've thoroughly addressed obvious concerns but ones that don't warrant to distract from the main argument of the text.\n cruxFromId\n extends classMarkupNode\n cells keywordCell\n javascript\n  get pattern() {\n   return this.getWordsFrom(1).join(\" \")\n  }\n  get attributes() {\n   return [`class=\"scrollCaveat\"`, `title=\"${this.caveatText}\"`]\n  }\n  get caveatText() {\n   return this.childrenToString().replace(/\\n/g, \" \")\n  }\nfootnoteNode\n todo Improve this\n description Provide a little more information to the interested reader, without diverting the main flow of the text.\n extends caveatNode\n crux footnote\nstrikethroughNode\n cruxFromId\n extends abstractMarkupNode\n javascript\n  tag = \"s\"\nwrapsOnNode\n cruxFromId\n description Enable `code`, *bold*, and _italics_ rules.\n extends abstractAftertextDirectiveNode\n javascript\n  get shouldMatchAll() {\n   return true\n  }\n  getMatches(text) {\n   return [this.runPattern(text, \"`\", \"code\"), this.runPattern(text, \"*\", \"strong\"), this.runPattern(text, \"_\", \"em\")].filter(i => i).flat()\n  }\n  runPattern(text, delimiter, tag, attributes = \"\") {\n   const escapedDelimiter = delimiter.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, \"\\\\$&\")\n   const pattern = new RegExp(`${escapedDelimiter}[^${escapedDelimiter}]+${escapedDelimiter}`, \"g\")\n   const delimiterLength = delimiter.length\n   return [...text.matchAll(pattern)].map(match => {\n    const { index } = match\n    const endIndex = index + match[0].length\n    return [{ index, string: `<${tag + (attributes ? \" \" + attributes : \"\")}>`, endIndex, consumeStartCharacters: delimiterLength }, { index: endIndex, endIndex, string: `</${tag}>`, consumeEndCharacters: delimiterLength }]\n   })\n  }\nwrapNode\n cruxFromId\n cells keywordCell delimiterCell tagOrUrlCell\n catchAllCellType htmlAttributesCell\n extends wrapsOnNode\n description Define a custom wrap, for example \"wrap _ em\" would support: _italics_.\n javascript\n  getMatches(text) {\n   try {\n    const delimiter = this.getWord(1)\n    const tag = this.getWord(2)\n    const attributes = this.getWordsFrom(3).join(\" \")\n    if (tag.startsWith(\"https:\")) return this.runPattern(text, delimiter, \"a\", `href=\"${tag}\"` + attributes)\n    return this.runPattern(text, delimiter, tag, attributes)\n   } catch (err) {\n    console.error(err)\n    return []\n   }\n   // Note: doubling up doesn't work because of the consumption characters.\n  }\ndatelineNode\n cruxFromId\n description Gives your paragraph a dateline like \"December 15, 2021 — The...\"\n extends abstractAftertextDirectiveNode\n javascript\n  getInserts() {\n   let day =\n    this.getContent() ||\n    this.getParent()\n     .getParent()\n     .get(\"date\")\n   if (!day) return false\n   try {\n    const dayjs = require(\"dayjs\")\n    day = dayjs(day).format(`MMMM D, YYYY`)\n   } catch (err) {\n    console.error(err)\n   }\n   return [{ index: 0, string: `<span class=\"scrollDateComponent\">${day} — </span>` }]\n  }\ndayjsNode\n description Advanced directive that evals some Javascript code in an environment including \"dayjs\".\n cruxFromId\n extends abstractAftertextDirectiveNode\n javascript\n  getInserts() {\n    const dayjs = require(\"dayjs\")\n    const days = eval(this.getContent())\n    const index = this.getParent().originalTextPostLinkify.indexOf(\"days\")\n    return [{ index, string: `${days} ` }]\n  }\nabstractMarkupParameterNode\n cells keywordCell\n cruxFromId\nmatchAllNode\n description Use this to match all occurrences of the text.\n extends abstractMarkupParameterNode\nmatchNode\n catchAllCellType integerCell\n description Use this to specify which index(es) to match.\n javascript\n  get indexes() {\n   return this.getWordsFrom(1).map(num => parseInt(num))\n  }\n example\n  aftertext\n   hello ello ello\n   bold ello\n    match 0 2\n extends abstractMarkupParameterNode\nlinkNoteNode\n description When you want to include more information than just the link to your reference.\n crux note\n cells keywordCell\n example\n  aftertext\n   This report showed the treatment had a big impact.\n  https://example.com/report This report.\n   note\n    The average growth in the treatment group was 14.2x higher than the control group.\n baseNodeType blobNode\n javascript\n  compile() {\n   return \"\"\n  }\nhiddenTitleNode\n description Set this to not print the title.\n crux hidden\n cells keywordCell\ncatchAllParagraphNode\n description A catch all block. This may be removed in future versions.\n catchAllCellType stringCell\n baseNodeType errorNode\n javascript\n  compile() { return `<p class=\"scrollParagraphComponent\">${this.getLine()}</p>`}\nerrorNode\n baseNodeType errorNode\nchatLineNode\n catchAllCellType anyCell\n catchAllNodeType chatLineNode\nlineOfCodeNode\n catchAllCellType codeCell\n catchAllNodeType lineOfCodeNode\ncommentLineNode\n catchAllCellType commentCell\ncssLineNode\n catchAllCellType anyCell\n catchAllNodeType cssLineNode\nhtmlLineNode\n catchAllCellType anyCell\n catchAllNodeType htmlLineNode\nstumpNode\n description Stump is a Tree Language that compiles to HTML.\n catchAllCellType anyCell\n catchAllNodeType stumpNode\nquoteLineNode\n catchAllCellType anyCell\n catchAllNodeType quoteLineNode\nreadingListItemNode\n cells urlCell\n catchAllCellType stringCell\n javascript\n  compile() {\n    const url = this.getWord(0)\n    const [title, author] = this.getContent().split(\" by \")\n    return `<li><a href=\"${url}\">${title ?? url}</a>${author ? ` by ${author}` : \"\"}</li>`\n  }\nblankLineNode\n description Blank lines compile to nothing in the HTML.\n cells blankCell\n javascript\n  compile() { return \"\"}\n pattern ^$\n tags doNotSynthesize\nscrollScriptNode\n extensions scroll\n description Tools for thought that compile to HTML.\n root\n inScope abstractScrollNode blankLineNode\n catchAllNodeType catchAllParagraphNode\n compilesTo html\n javascript\n  setFile(file) {\n    this.file = file\n    return this\n  }\n  file = {}\n  get permalink() {\n   return this.get(\"permalink\") || this.file.permalink || \"\"\n  }\n example\n  title Hello world\n  section This is Scroll\n  \n  paragraph\n   It compiles to HTML. Blank lines get turned into brs.\n  \n  code\n   // You can add code as well.\n   print(\"Hello world\")\nrowNode\n catchAllCellType stringCell\n javascript\n  toRow(columns, delimiter) {\n   const words = this.getLine().split(delimiter)\n   let str = \"\"\n   let column = 0\n   const columnCount = columns.length\n   while (column < columnCount) {\n    const col = columns[column]\n    column++\n    const content = columnCount === column ? words.slice(columnCount - 1).join(\" \") : words[column - 1]\n    if (col.isLink) continue\n    let tagged = content\n    const link = words[col.linkIndex]\n    if (col.linkIndex > -1 && link)\n     tagged = `<a href=\"${link}\">${content}</a>`\n    str += `<td>${tagged}</td>\\n`\n   }\n   return str\n  }\ntreeRowContentNode\n description Any blob content in a cell.\n cells stringCell\n catchAllCellType stringCell\ntreeRowColumnNode\n catchAllNodeType treeRowContentNode\n description A columnName value pair, or just a columnName if the value is a text blob.\n cells idCell\n catchAllCellType stringCell\ntreeRowNode\n cells idCell\n description The root node of a row.\n catchAllNodeType treeRowColumnNode\n javascript\n  toRow(columns) {\n   let str = \"\"\n   columns.forEach(col => {\n    const node = this.getNode(col.name)\n    if (col.isLink) return\n    if (!node) {\n      str += \"<td></td>\\n\"\n      return\n    }\n    const content = node.length ? node.childrenToString() : node.getContent()\n    let tagged = \"\"\n    const link = this.get(col.name + \"Link\")\n    if (col.linkIndex > -1 && link)\n     tagged = `<a href=\"${link}\">${content}</a>`\n    else if (node.length)\n     tagged = `<pre>${content ?? \"\"}</pre>`\n    else\n     tagged = content ?? \"\"\n    str += `<td>${tagged}</td>\\n`\n   })\n   return str\n  }","style":"html,body,div,span,h1,h2,h3,h4,p,ol,ul,table,figure {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  vertical-align: baseline;\n  border-spacing: 0;\n}\nhtml {\n  background-color: rgb(244,244,244);\n  font-family: Exchange,Georgia,serif;\n  color: #000;\n  font-size: 14px;\n  hyphens: auto;\n}\n.scrollHeaderComponent svg {\n  width: 30px;\n  fill: rgba(204,204,204,.8);\n}\n.scrollHeaderComponent svg:hover {\n  fill: #333;\n}\n.scrollHeaderComponent a {\n  color: rgba(204,204,204,.8);\n  position: absolute;\n  font-size: 30px;\n  line-height: 30px;\n  text-decoration: none;\n}\n.scrollHeaderComponent a:hover {\n  color: #333;\n}\n.scrollHeaderComponent .scrollTopLeftBarComponent {\n  text-align: left;\n  left: 25px;\n}\n.scrollHeaderComponent .scrollTopRightBarComponent {\n  text-align: right;\n  right: 25px;\n}\n.scrollHeaderComponent a.scrollPrevPageLink {\n  left: 3px;\n}\n.scrollHeaderComponent a.scrollNextPageLink {\n  right: 3px;\n}\n.scrollFooterComponent {\n  border-top: 1px solid rgb(204,204,204);\n  margin-top: 8px;\n  padding-top: 8px;\n  text-align: center;\n}\n.scrollFooterComponent svg {\n  width: 30px;\n  fill: rgba(204,204,204, .5);\n  padding: 0 7px;\n}\n.scrollFooterComponent svg:hover {\n  fill: #333;\n}\n.scrollCommunityLinkComponent {\n  display: block;\n  font-family: Verdana;\n  font-weight: 100;\n  margin: .5em;\n  padding-bottom: 1em;\n  text-decoration: none;\n  color: rgba(204,204,204,.5);\n}\n.scrollGroupPageComponent,.scrollFilePageComponent {\n  column-count: auto;\n  column-fill: balance;\n  column-width: 35ch;\n  column-gap: 20px;\n  column-rule: 1px solid rgb(204,204,204);\n  padding-left: 20px;\n  padding-right: 20px;\n  margin: auto;\n}\n.scrollFilePageComponent {\n  column-rule: none;\n  padding-top: 8px;\n}\n.scrollFilePageComponent .scrollTitleComponent {\n  display: none;\n}\n.scrollFilePageTitle {\n  text-align: center;\n  margin-top: 8px;\n  margin-bottom: 8px;\n  padding-left: 50px;\n  padding-right: 50px;\n}\n.scrollFilePageTitle a {\n  text-decoration: none;\n  color: #000;\n}\n.scrollGroupPageFileContainerComponent {\n  border-bottom: 1px solid rgb(204,204,204);\n  padding: 1ch 0;\n  break-inside: avoid;\n  text-align: justify;\n  margin-bottom: .5em;\n}\n.scrollTitleComponent {\n  text-align: center;\n  font-size: 24px;\n  margin-bottom: .25em;\n}\n.scrollTitleComponent a {\n  text-decoration: none;\n  color: #000;\n}\n.scrollDateComponent {\n  font-style: italic;\n  font-size: 80%;\n}\n.scrollParagraphComponent {\n  margin-top: 0.4em;\n  line-height: 1.4em;\n}\n.scrollQuoteComponent {\n  break-inside: avoid;\n  display: block;\n  margin: .5em 0;\n  padding: .5em;\n  background: rgba(204,204,204,.5);\n  white-space: pre-line;\n  border-left: .5em solid rgba(204,204,204,.8);\n}\n.scrollSectionComponent {\n  text-align: center;\n  margin-top: 1em;\n}\n.scrollQuestionComponent {\n  text-align: left;\n  margin-top: 2em;\n}\ncode {\n  font-size: 90%;\n  background-color: rgba(204,204,204,.5);\n  padding: 2px 4px;\n  border-radius: 4px;\n}\n.scrollCodeBlockComponent {\n  overflow: auto;\n  font-size: 80%;\n  hyphens: none;\n  white-space: pre;\n  border-left: .5em solid rgba(204,204,204,.8);\n  break-inside: avoid;\n  display: block;\n  margin: .5em 0;\n  padding: .5em;\n  border-radius: 0;\n}\n.scrollTableComponent {\n  table-layout: fixed;\n  margin: .5em 0;\n  overflow: hidden;\n  font-size: 80%;\n  width: 100%;\n  hyphens: none;\n  border: 1px solid rgba(224,224,224,.8);\n}\n.scrollTableComponent td,.scrollTableComponent th {\n  padding: 3px;\n  overflow: hidden;\n}\n.scrollTableComponent th {\n  border-bottom: 2px solid rgba(0,0,0,.6);\n  text-align: left;\n}\n.scrollTableComponent tr:nth-child(even) {\n  background: rgba(224,224,224,.6);\n}\n.scrollAuthor {\n  font-size: 12px;\n  font-style: italic;\n  margin: 4px 0;\n  text-align: center;\n}\n.scrollKpiTable {\n  width: 100%;\n  font-size: 30px;\n  text-align: center;\n  font-weight: bold;\n  break-inside: avoid;\n  margin-top: 8px;\n  margin-bottom: 8px;\n}\n.scrollKpiTable td {\n  width: 33.3%;\n  border: 1px solid #e8e8e8;\n}\n.scrollKpiTable span {\n  font-size: 20p;;\n  display: block;\n}\n.scrollFileViewSourceUrlComponent {\n  text-align: center;\n  font-size: 80%;\n  margin: 0;\n  margin-top: 0.4em;\n  line-height: 1.4em;\n}\n.scrollFileViewSourceUrlComponent a {\n  color: #000;\n  text-decoration: none;\n}\n.scrollContinueReadingLink {\n  display: block;\n  text-align: center;\n}\n.scrollDialogueComponent span {\n  font-family: Verdana;\n  margin-top: 5px;\n  padding: 5px 20px;\n  border-radius: 15px;\n  display: inline-block;\n}\n.scrollDialogueComponentLeft {\n  text-align: left;\n}\n.scrollDialogueComponentLeft span {\n  background: rgba(204,204,204, .5);\n}\n.scrollDialogueComponentRight {\n  text-align: right;\n}\n.scrollDialogueComponentRight span {\n  color: white;\n  background: rgb(0,132,255);\n}\n.scrollImageComponent {\n  display: block;\n  text-align: center;\n}\n.scrollImageComponent img {\n  max-width: 98%;\n  height: auto;\n}\n.scrollImageComponent figcaption {\n  font-style: italic;\n}\n.scrollKeyboardNav {\n  display: none;\n}\n.scrollCaveat {\n  text-decoration: underline dashed 1px rgba(0,0,0,.1);\n  cursor: default;\n}\n"}