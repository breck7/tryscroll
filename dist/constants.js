const AppConstants = {"grammar":"tooling A function generates this Scrolldown grammar by combining all files in the grammars folder.\ntooling\n Related work\n CSS is great for text selector ideas: https://www.w3schools.com/cssref/css_selectors.asp\n Roff has a lot of related markup ideas: https://www.systutorials.com/docs/linux/man/7-groff_man/\nclassNameCell\n highlightScope constant\nhtmlIdCell\n extends idCell\ndateCell\n highlightScope string\nintegerCell\n highlightScope constant.numeric\npermalinkCell\n highlightScope string\nanyCell\nurlCell\n highlightScope constant.language\nkeywordCell\n highlightScope keyword\ntextCell\n highlightScope string\nidCell\n highlightScope string\nblankCell\ncodeCell\n highlightScope comment\ncommentCell\n highlightScope comment\nbulletPointCell\n highlightScope keyword\naftertextTextNode\n catchAllCellType textCell\n boolean isTextNode true\nabstractScrollNode\n abstract\n cells keywordCell\naftertextNode\n description Text followed by markup commands.\n extends abstractScrollNode\n catchAllNodeType aftertextTextNode\n inScope abstractAftertextDirectiveNode abstractAftertextAttributeNode\n crux aftertext\n example\n  aftertext\n   Hello brave new world\n   link home.com new\n   bold brave new\n   underline new world\n   strikethrough wor\n javascript\n  get markupInserts() {\n   const { originalText } = this\n   return this.filter(node => node.isMarkupNode)\n    .map(node => node.getInserts(originalText))\n    .filter(i => i)\n    .flat()\n  }\n  get originalText() {\n   return this.filter(node => node.isTextNode)\n    .map(node => node.toString())\n    .join(\"\\n\")\n  }\n  get text() {\n   const { originalText, markupInserts } = this\n   let adjustment = 0\n   let newText = originalText\n   // If multiple tags start at same index, the tag that closes first should start last. Otherwise HTML breaks.\n   markupInserts.sort((a, b) => (a.index === b.index ? b.endIndex - a.endIndex : a.index - b.index))\n   markupInserts.forEach(insertion => {\n    insertion.index += adjustment\n    newText = newText.slice(0, insertion.index) + insertion.string + newText.slice(insertion.index)\n    adjustment += insertion.string.length\n   })\n   return newText\n  }\n  compile() {\n   return `<p ${this.divAttributes}class=\"scrollParagraphComponent\">${this.text}</p>`\n  }\n  get divAttributes() {\n   const attrs = this.filter(node => node.isAttributeNode)\n   return attrs.length ? attrs.map(node => node.divAttributes).join(\" \") + \" \" : \"\"\n  }\nloremIpsumNode\n extends aftertextNode\n description Generate dummy text.\n crux loremIpsum\n catchAllCellType integerCell\n javascript\n  get originalText() {\n   return `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`\n  }\n  compile() {\n   return super.compile().repeat(this.getWord(1) ? parseInt(this.getWord(1)) : 1)\n  }\nabstractTopLevelSingleMetaNode\n abstract\n description Use these keywords once per file.\n extends abstractScrollNode\n cells keywordCell\n compiler\n  stringTemplate \npermalinkNode\n description When compiling, Scroll will save this article to {permalink}.html\n crux permalink\n extends abstractTopLevelSingleMetaNode\n cells keywordCell permalinkCell\nskipIndexPageNode\n description Add this tag if you want to build a page but not include it in the index page.\n crux skipIndexPage\n extends abstractTopLevelSingleMetaNode\ntitleNode\n catchAllCellType textCell\n description Title of the article.\n extends abstractTopLevelSingleMetaNode\n crux title\n javascript\n  compile() {\n   return `<h1 class=\"scrollTitleComponent\"><a href=\"${this.getRootNode().permalink}.html\">${this.getContent()}</a></h1>`\n  }\ndateNode\n catchAllCellType dateCell\n description Date the article was first published.\n extends abstractTopLevelSingleMetaNode\n crux date\nmaxColumnsNode\n catchAllCellType integerCell\n description Set your own max column count for a single article's generated HTML.\n extends abstractTopLevelSingleMetaNode\n crux maxColumns\ncolumnWidthNode\n catchAllCellType integerCell\n description Set your own column width, in ch units, for the generated HTML.\n extends abstractTopLevelSingleMetaNode\n crux columnWidth\nchatNode\n description A dialogue between two people.\n catchAllNodeType chatLineNode\n crux chat\n extends abstractScrollNode\n javascript\n  compile() {\n   return this.map((line, index) => `<div class=\"scrollDialogueComponent ${index % 2 ? \"scrollDialogueComponentRight\" : \"scrollDialogueComponentLeft\"}\"><span>${line.toString()}</span></div>`).join(\"\")\n  }\ncodeNode\n description A code block.\n catchAllNodeType lineOfCodeNode\n extends abstractScrollNode\n javascript\n  compile() {\n   return `<code class=\"scrollCodeBlockComponent\">${this.childrenToString().replace(/\\</g, \"&lt;\")}</code>`\n  }\n crux code\ncodeWithLanguageNode\n description Use this to specify the language of the code block, such as csvCode or rustCode.\n extends codeNode\n pattern ^[a-zA-Z0-9_]+Code$\nbelowAsCodeNode\n description Print the Scroll code of the next node.\n extends abstractScrollNode\n crux belowAsCode\n javascript\n  get target() {\n   return this.getNext()\n  }\n  compile() {\n   return `<code class=\"scrollCodeBlockComponent\">${this.target.toString().replace(/\\</g, \"&lt;\")}</code>`\n  }\naboveAsCodeNode\n description Print the Scroll code for the previous node.\n extends belowAsCodeNode\n crux aboveAsCode\n javascript\n  get target() {\n   return this.getPrevious()\n  }\ncommentNode\n description Will not appear in the compiled HTML.\n catchAllCellType commentCell\n extends abstractScrollNode\n crux comment\n javascript\n  compile() {\n   return ``\n  }\n catchAllNodeType commentLineNode\ncssNode\n extends abstractScrollNode\n description Prints CSS content wrapped in a style tag.\n crux css\n extends abstractScrollNode\n catchAllNodeType cssLineNode\n javascript\n  compile() {\n   return `<style>${this.childrenToString()}</style>`\n  }\nabstractHeaderNode\n catchAllCellType textCell\n extends abstractScrollNode\n catchAllNodeType multilineTitleNode\n javascript\n  compile() {\n   const children = this.childrenToString() ? \" \" + this.childrenToString() : \"\"\n   return `<${this.tag} class=\"${this.className}\">${this.getContent() + children}</${this.tag}>`\n  }\nsectionNode\n description Compiles to an h3 tag.\n extends abstractHeaderNode\n crux section\n javascript\n  tag = \"h3\"\n  className = \"scrollSectionComponent\"\nsubsectionNode\n description Compiles to an h4 tag.\n extends abstractHeaderNode\n crux subsection\n javascript\n  tag = \"h4\"\n  className = \"scrollSubsectionComponent\"\nquestionNode\n description Use for pages like FAQs.\n extends abstractHeaderNode\n crux question\n javascript\n  tag = \"h4\"\n  className = \"scrollQuestionComponent\"\nhtmlNode\n description A catch all block to drop in any loose html.\n crux html\n extends abstractScrollNode\n catchAllNodeType htmlLineNode\n javascript\n  compile() {\n   return `${this.childrenToString()}`\n  }\nimageNode\n description An img tag.\n cells keywordCell urlCell\n extends abstractScrollNode\n crux image\n inScope imageCaptionNode\n javascript\n  compile() {\n   const src = this.getWord(1)\n   let imgTag = \"\"\n   try {\n    const sizeOf = require(\"image-size\")\n    const dimensions = sizeOf(src)\n    const width = dimensions.width\n    const height = dimensions.height\n    imgTag = `<img src=\"${src}\" width=\"${width}\" height=\"${height}\" loading=\"lazy\"/>`\n   } catch (err) {\n    console.error(err)\n    imgTag = `<img src=\"${src}\">`\n   }\n   const caption = this.get(\"caption\")\n   const captionFig = caption ? `<figcaption>${caption}</figcaption>` : \"\"\n   return `<figure class=\"scrollImageComponent\"><a href=\"${src}\" target=\"_blank\">${imgTag}</a>${captionFig}</figure>`\n  }\ncustomHeaderNode\n extends abstractScrollNode\n description Define a header for a certain page. Setting to blank will also remove the header on a page.\n crux header\n catchAllNodeType stumpNode\n javascript\n  compile() {\n   return \"\"\n  }\ncustomFooterNode\n extends abstractScrollNode\n description Define a footer for a certain page. Setting to blank will also remove the footer on a page.\n crux footer\n catchAllNodeType stumpNode\n javascript\n  compile() {\n   return \"\"\n  }\nlistNode\n description An unordered list.\n catchAllNodeType listItemNode\n crux list\n extends abstractScrollNode\n compiler\n  stringTemplate \n  openChildren <ul class=\"scrollUnorderedListComponent\">\n  closeChildren </ul>\norderedListNode\n description An ordered list.\n extends listNode\n crux orderedList\n compiler\n  stringTemplate \n  openChildren <ol class=\"scrollOrderedListComponent\">\n  closeChildren </ol>\nparagraphNode\n description Prose content.\n catchAllNodeType paragraphContentNode\n extends abstractScrollNode\n crux paragraph\n javascript\n  get paragraphContent() {\n   return this.childrenToString()\n  }\n  compile() {\n   return `<p class=\"scrollParagraphComponent\">${this.getRootNode().compileATags(this.paragraphContent)}</p>`\n  }\nquoteNode\n description A blockquote.\n catchAllNodeType quoteLineNode\n extends abstractScrollNode\n javascript\n  compile() {\n   return `<blockquote class=\"scrollQuoteComponent\">${this.childrenToString()}</blockquote>`\n  }\n crux quote\nabstractTableNode\n catchAllNodeType rowNode\n extends abstractScrollNode\n javascript\n  _delimiter = \" \"\n  get tableHeader() {\n   return this.columns.filter(col => !col.isLink).map(column => `<th>${column.name}</th>\\n`)\n  }\n  get columns() {\n   const header = this.nodeAt(0)\n   const cols = header ? header.getLine().split(this._delimiter) : []\n   return cols.map((name, index) => {\n    const isLink = name.endsWith(\"Link\")\n    const linkIndex = cols.indexOf(name + \"Link\")\n    return {\n     name,\n     isLink,\n     linkIndex\n    }\n   })\n  }\n  getTableBody() {\n   const delimiter = this._delimiter\n   return this.getTopDownArray()\n    .slice(1)\n    .map(node => `<tr>${node.toRow(this.columns, delimiter)}</tr>`)\n    .join(\"\\n\")\n  }\n  compile() {\n   return `<table class=\"scrollTableComponent\"><thead><tr>${this.tableHeader.join(\"\\n\")}</tr></thead>\\n<tbody>${this.getTableBody()}</tbody></table>`\n  }\ncommaTableNode\n crux commaTable\n description Comma separated values table.\n extends abstractTableNode\n javascript\n  _delimiter = \",\"\npipeTableNode\n crux pipeTable\n description Pipie separated values table.\n extends abstractTableNode\n javascript\n  _delimiter = \"|\"\ntabTableNode\n crux tabTable\n description Tab separated values table.\n extends abstractTableNode\n javascript\n  _delimiter = \"\\t\"\nspaceTableNode\n description Space separated values table. Last column is a catch all.\n extends abstractTableNode\n crux spaceTable\nabstractAftertextAttributeNode\n cells keywordCell\n boolean isAttributeNode true\n javascript\n  get divAttributes() {\n   return `${this.getWord(0)}=\"${this.getContent()}\"`\n  }\n  compile() {\n   return \"\"\n  }\naftertextIdNode\n crux id\n description Provide an ID to be output in the generated HTML paragraph.\n extends abstractAftertextAttributeNode\n cells keywordCell htmlIdCell\n single\nabstractAftertextDirectiveNode\n cells keywordCell\n catchAllCellType textCell\n javascript\n  isMarkupNode = true\n  get pattern() {\n   return this.getWordsFrom(1).join(\" \")\n  }\n  getInserts(text) {\n   const { pattern } = this\n   const escapedPattern = pattern.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, \"\\\\$&\")\n   const matches = [...text.matchAll(new RegExp(escapedPattern, \"g\"))].map(match => {\n    const { index } = match\n    const endIndex = index + pattern.length\n    return [\n     { index, string: `<${this.openTag}${this.allAttributes}>`, endIndex: index + pattern.length },\n     { index: endIndex, endIndex, string: `</${this.closeTag}>` }\n    ]\n   })\n   if (!matches.length) return false\n   if (this.has(\"matchAll\")) return matches.flat()\n   const indexNode = this.getNode(\"match\")\n   if (indexNode)\n    return indexNode.indexes\n     .map(index => matches[index])\n     .filter(i => i)\n     .flat()\n   return matches[0]\n  }\n  get allAttributes() {\n   const attr = this.attributes.join(\" \")\n   return attr ? \" \" + attr : \"\"\n  }\n  get attributes() {\n   return []\n  }\n  get openTag() {\n   return this.tag\n  }\n  get closeTag() {\n   return this.tag\n  }\nabstractMarkupNode\n extends abstractAftertextDirectiveNode\n inScope abstractMarkupParameterNode\nboldNode\n crux bold\n extends abstractMarkupNode\n javascript\n  tag = \"b\"\nitalicsNode\n crux italics\n extends abstractMarkupNode\n javascript\n  tag = \"i\"\nunderlineNode\n crux underline\n extends abstractMarkupNode\n javascript\n  tag = \"u\"\naftertextCodeNode\n crux code\n extends abstractMarkupNode\n javascript\n  tag = \"code\"\nlinkNode\n extends abstractMarkupNode\n cells keywordCell urlCell\n inScope linkNoteNode\n crux link\n javascript\n  tag = \"a\"\n  get link() {\n   return this.getWord(1)\n  }\n  get attributes() {\n   const attrs = [`href=\"${this.link}\"`]\n   const title = this.getNode(\"note\")\n   if (title) attrs.push(`title=\"${title.childrenToString().replace(/\\n/g, \" \")}\"`)\n   return attrs\n  }\n  get pattern() {\n   return this.getWordsFrom(2).join(\" \")\n  }\nemailLinkNode\n description A mailto link\n crux email\n extends linkNode\n javascript\n  get attributes() {\n   return [`href=\"mailto:${this.link}\"`]\n  }\nquickLinkNode\n pattern ^https\\:\n extends linkNode\n cells urlCell\n javascript\n  get link() {\n   return this.getWord(0)\n  }\n  get pattern() {\n   return this.getWordsFrom(1).join(\" \")\n  }\nclassMarkupNode\n description Add a span with a class name around matching text.\n extends abstractMarkupNode\n cells keywordCell classNameCell\n crux class\n javascript\n  tag = \"span\"\n  get className() {\n   return this.getWord(1)\n  }\n  get attributes() {\n   return [`class=\"${this.className}\"`]\n  }\n  get pattern() {\n   return this.getWordsFrom(2).join(\" \")\n  }\ncaveatNode\n description Add a caveat viewable on hover on matching text. When you want to be sure you've thoroughly addressed obvious concerns but ones that don't warrant to distract from the main argument of the text.\n crux caveat\n extends classMarkupNode\n cells keywordCell\n javascript\n  get pattern() {\n   return this.getWordsFrom(1).join(\" \")\n  }\n  get attributes() {\n   return [`class=\"scrollCaveat\"`, `title=\"${this.caveatText}\"`]\n  }\n  get caveatText() {\n   return this.childrenToString().replace(/\\n/g, \" \")\n  }\nstrikethroughNode\n crux strikethrough\n extends abstractMarkupNode\n javascript\n  tag = \"s\"\ndatelineNode\n crux dateline\n description Gives your paragraph a dateline like \"December 15, 2021 — The...\"\n extends abstractAftertextDirectiveNode\n javascript\n  getInserts() {\n   let day =\n    this.getContent() ||\n    this.getParent()\n     .getParent()\n     .get(\"date\")\n   if (!day) return false\n   try {\n    const dayjs = require(\"dayjs\")\n    day = dayjs(day).format(`MMMM D, YYYY`)\n   } catch (err) {\n    console.error(err)\n   }\n   return [{ index: 0, string: `<span class=\"scrollArticleDateComponent\">${day} — </span>` }]\n  }\nabstractMarkupParameterNode\n cells keywordCell\nmatchAllNode\n description Use this to match all occurrences of the text.\n extends abstractMarkupParameterNode\n crux matchAll\nmatchNode\n catchAllCellType integerCell\n description Use this to specify which index(es) to match.\n javascript\n  get indexes() {\n   return this.getWordsFrom(1).map(num => parseInt(num))\n  }\n example\n  aftertext\n   hello ello ello\n   bold ello\n    match 0 2\n extends abstractMarkupParameterNode\n crux match\nlinkNoteNode\n description When you want to include more information than just the link to your reference.\n crux note\n cells keywordCell\n example\n  aftertext\n   This report showed the treatment had a big impact.\n  https://example.com/report This report.\n   note\n    The average growth in the treatment group was 14.2x higher than the control group.\n baseNodeType blobNode\n compiler\n  stringTemplate \nerrorNode\n baseNodeType errorNode\nscrolldownNode\n extensions scroll\n description A simple language for structurable thought. An extensible alternative to Markdown. Compiles to HTML.\n root\n inScope abstractScrollNode blankLineNode\n catchAllNodeType quickParagraphNode\n compilesTo html\n javascript\n  get permalink() {\n   return this.get(\"permalink\") || this._permalink || \"\"\n  }\n  setPermalink(permalink) {\n   this._permalink = permalink\n   return this\n  }\n  compileATags(text) {\n   // todo: a better place for these util functions? I stick them in here so the\n   // grammar is all in one file for ease of use in TreeLanguageDesigner\n   const linkReplacer = (match, p1, p2, p3, offset, str) => {\n    let suffix = \"\"\n    if (p3.endsWith(\",\")) suffix = \",\" + suffix\n    if (p3.endsWith(\".\")) suffix = \".\" + suffix\n    p3 = p3.replace(/(,|\\.)$/, \"\")\n    let prefix = \"https://\"\n    const isRelativeLink = p3.startsWith(\"./\")\n    if (isRelativeLink) {\n     prefix = \"\"\n     p3 = p3.substr(2)\n    }\n    if (p3.startsWith(\"https://\") || p3.startsWith(\"http://\")) prefix = \"\"\n    return `${p1}<a href=\"${prefix}${p3}\">${p2}</a>${suffix}`\n   }\n   return text.replace(/(^|\\s)(\\S+)🔗(\\S+)(?=(\\s|$))/g, linkReplacer)\n  }\n example\n  title Hello world\n  section This is Scrolldown\n  \n  paragraph\n   It compiles to HTML. Blank lines get turned into brs.\n  \n  code\n   // You can add code as well.\n   print(\"Hello world\")\nblankLineNode\n description Blank lines compile to nothing in the HTML.\n cells blankCell\n compiler\n  stringTemplate \n pattern ^$\n tags doNotSynthesize\nquickParagraphNode\n description A catch all block. This may be removed in future versions.\n catchAllCellType textCell\n baseNodeType errorNode\n compiler\n  stringTemplate <p class=\"scrollParagraphComponent\">{textCell}</p>\nchatLineNode\n catchAllCellType anyCell\n catchAllNodeType chatLineNode\nlineOfCodeNode\n catchAllCellType codeCell\n catchAllNodeType lineOfCodeNode\ncommentLineNode\n catchAllCellType commentCell\ncssLineNode\n catchAllCellType anyCell\n catchAllNodeType cssLineNode\nmultilineTitleNode\n catchAllCellType textCell\nhtmlLineNode\n catchAllCellType anyCell\n catchAllNodeType htmlLineNode\nimageCaptionNode\n description An optional caption to accompany the image.\n crux caption\n cells keywordCell\n catchAllCellType textCell\nstumpNode\n description Stump is a Tree Language that compiles to HTML.\n catchAllCellType anyCell\n catchAllNodeType stumpNode\nlistItemNode\n cells bulletPointCell\n catchAllCellType textCell\n javascript\n  compile() {\n   return `<li>${this.getRootNode().compileATags(this.getContent() || \"\")}</li>`\n  }\nparagraphContentNode\n catchAllCellType textCell\nquoteLineNode\n catchAllCellType anyCell\n catchAllNodeType quoteLineNode\nrowNode\n catchAllCellType textCell\n javascript\n  toRow(columns, delimiter) {\n   const words = this.getLine().split(delimiter)\n   let str = \"\"\n   let column = 0\n   const columnCount = columns.length\n   while (column < columnCount) {\n    const col = columns[column]\n    column++\n    const content = columnCount === column ? words.slice(columnCount - 1).join(\" \") : words[column - 1]\n    if (col.isLink) continue\n    let tagged = \"\"\n    const link = words[col.linkIndex]\n    if (col.linkIndex > -1 && link) tagged = `<a href=\"${link}\">${content}</a>`\n    else tagged = this.getRootNode().compileATags(content ?? \"\")\n    str += `<td>${tagged}</td>\\n`\n   }\n   return str\n  }","style":"html,\nbody,\ndiv,\nspan,\nh1,\nh2,\nh3,\nh4,\np,\nol,\nul,\ntable,\nfigure {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tvertical-align: baseline;\n\tborder-spacing: 0;\n}\nhtml {\n\tbackground-color: rgb(244, 244, 244);\n\tfont-family: Exchange, Georgia, serif;\n\tcolor: #000;\n\tfont-size: 14px;\n\thyphens: auto;\n}\n.scrollHeaderComponent {\n\tborder-bottom: 1px solid rgb(204, 204, 204);\n\ttext-align: center;\n\tpadding-bottom: 8px;\n}\n.scrollNameComponent a {\n\ttext-decoration: none;\n\tcolor: #000;\n}\n.scrollTopRightBarComponent {\n\ttext-align: right;\n\tposition: absolute;\n\tright: 25px;\n\ttop: 3px;\n}\n.scrollSocialMediaIconsComponent svg {\n\twidth: 30px;\n\tfill: rgba(204, 204, 204, 0.5);\n\tmargin-left: 15px;\n}\n.scrollSocialMediaIconsComponent svg:hover {\n\tfill: #333;\n}\n.scrollFooterComponent {\n\tborder-top: 1px solid rgb(204, 204, 204);\n\tmargin-top: 8px;\n\tpadding-top: 8px;\n\ttext-align: center;\n}\n.scrollCommunityLinkComponent {\n\tdisplay: block;\n\tfont-family: Verdana;\n\tfont-weight: 100;\n\tmargin: 0.5em;\n\tpadding-bottom: 1em;\n\ttext-decoration: none;\n\tcolor: rgba(204, 204, 204, 0.5);\n}\n.scrollIndexPageComponent,\n.scrollArticlePageComponent {\n\tcolumn-count: auto;\n\tcolumn-fill: balance;\n\tcolumn-width: 35ch;\n\tcolumn-gap: 20px;\n\tcolumn-rule: 1px solid rgb(204, 204, 204);\n\tpadding-left: 20px;\n\tpadding-right: 20px;\n\tmargin: auto;\n}\n.scrollArticlePageComponent {\n\tcolumn-rule: none;\n\tpadding-top: 8px;\n}\n.scrollIndexPageArticleContainerComponent {\n\tborder-bottom: 1px solid rgb(204, 204, 204);\n\tpadding: 1ch 0;\n\tbreak-inside: avoid;\n\ttext-align: justify;\n\tmargin-bottom: 0.5em;\n}\n.scrollTitleComponent {\n\ttext-align: center;\n\tfont-size: 24px;\n\tmargin-bottom: 0.25em;\n}\n.scrollTitleComponent a {\n\ttext-decoration: none;\n\tcolor: #000;\n}\n.scrollArticleDateComponent {\n\tfont-style: italic;\n\tfont-size: 80%;\n}\n.scrollParagraphComponent {\n\tmargin-top: 0.4em;\n\tline-height: 1.4em;\n}\n.scrollQuoteComponent {\n\tbreak-inside: avoid;\n\tdisplay: block;\n\tmargin: 0.5em 0;\n\tpadding: 0.5em;\n\tbackground: rgba(204, 204, 204, 0.5);\n\twhite-space: pre-line;\n\tborder-left: 0.5em solid rgba(204, 204, 204, 0.8);\n}\n.scrollSectionComponent,\n.scrollSubsectionComponent {\n\ttext-align: center;\n\tmargin-top: 1em;\n}\n.scrollQuestionComponent {\n\ttext-align: left;\n\tmargin-top: 2em;\n}\ncode {\n\tfont-size: 90%;\n\tbackground-color: rgba(204, 204, 204, 0.5);\n\tpadding: 2px 4px;\n\tborder-radius: 4px;\n}\n.scrollCodeBlockComponent {\n\toverflow: auto;\n\tfont-size: 80%;\n\thyphens: none;\n\twhite-space: pre;\n\tborder-left: 0.5em solid rgba(204, 204, 204, 0.8);\n\tbreak-inside: avoid;\n\tdisplay: block;\n\tmargin: 0.5em 0;\n\tpadding: 0.5em;\n\tborder-radius: 0;\n}\n.scrollTableComponent {\n\ttable-layout: fixed;\n\tmargin: 0.5em 0;\n\toverflow: hidden;\n\tfont-size: 80%;\n\twidth: 100%;\n\thyphens: none;\n\tborder: 1px solid rgba(224, 224, 224, 0.8);\n}\n.scrollTableComponent td,\n.scrollTableComponent th {\n\tpadding: 3px;\n\toverflow: hidden;\n}\n.scrollTableComponent th {\n\tborder-bottom: 2px solid rgba(0, 0, 0, 0.6);\n\ttext-align: left;\n}\n.scrollTableComponent tr:nth-child(even) {\n\tbackground: rgba(224, 224, 224, 0.6);\n}\n.scrollUnorderedListComponent,\n.scrollOrderedListComponent {\n\ttext-align: left;\n\tline-height: 1.4em;\n\tpadding-left: 1em;\n\tmargin-top: 0.4em;\n}\n.scrollArticleSourceLinkComponent {\n\ttext-align: center;\n\tfont-size: 80%;\n\tmargin: 0;\n\tmargin-top: 0.4em;\n\tline-height: 1.4em;\n}\n.scrollArticleSourceLinkComponent a {\n\tcolor: #000;\n\ttext-decoration: none;\n}\n.scrollDialogueComponent span {\n\tfont-family: Verdana;\n\tmargin-top: 5px;\n\tpadding: 5px 20px;\n\tborder-radius: 15px;\n\tdisplay: inline-block;\n}\n.scrollDialogueComponentLeft {\n\ttext-align: left;\n}\n.scrollDialogueComponentLeft span {\n\tbackground: rgba(204, 204, 204, 0.5);\n}\n.scrollDialogueComponentRight {\n\ttext-align: right;\n}\n.scrollDialogueComponentRight span {\n\tcolor: white;\n\tbackground: rgb(0, 132, 255);\n}\n.scrollImageComponent {\n\tdisplay: block;\n\ttext-align: center;\n}\n.scrollImageComponent img {\n\tmax-width: 35ch;\n\theight: auto;\n}\n.scrollImageComponent figcaption {\n\tfont-style: italic;\n}\n.scrollCaveat {\n\ttext-decoration: underline dashed 1px rgba(0, 0, 0, 0.1);\n\tcursor: default;\n}\n"}