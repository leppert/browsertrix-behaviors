/*! behaviors.js is part of Webrecorder project. Copyright (C) 2021, Webrecorder Software. Licensed under the Affero General Public License v3. */(()=>{"use strict";let t=console.log,e=null;const i=200;function s(t){return new Promise((e=>setTimeout(e,t)))}async function o(t,e){for(;!t();)await s(e)}function a(){return new Promise((t=>{"complete"===document.readyState?t():window.addEventListener("load",t)}))}function n(t,e){try{t(e)}catch(i){t(JSON.stringify(e))}}function r(e,i="debug"){t&&n(t,{data:e,type:i})}function l(e){t=e}class h{constructor(t,e){this.matchValue=w(t,e)}async restore(t,e){let i=null;for(;i=d(t),!i;)await s(100);return d(e.replace("$1",this.matchValue),i)}}class c{constructor(t){this.loc=window.location.href,t()}get changed(){return window.location.href!==this.loc}goBack(t){if(!this.changed)return Promise.resolve(!0);const e=d(t);return new Promise((t=>{window.addEventListener("popstate",(()=>{t()}),{once:!0}),e?e.click():window.history.back()}))}}function d(t,e){return e=e||document,document.evaluate(t,e,null,XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue}function*u(t,e){e=e||document;let i=document.evaluate(t,e,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE),s=null;for(;null!==(s=i.iterateNext());)yield s}function w(t,e){return e=e||document,document.evaluate(t,e,null,XPathResult.STRING_TYPE).stringValue}async function*m(t,e,i){let a=t.firstElementChild;for(;a;)yield a,a.nextElementSibling||await Promise.race([o((()=>!!a.nextElementSibling),e),s(i)]),a=a.nextElementSibling}class f{debug(t){r(t,"debug")}log(t){r(t,"info")}}class g extends f{constructor(){super(),this._running=null,this.paused=null,this._unpause=null,this.state={},this.scrollOpts={behavior:"smooth",block:"center",inline:"center"}}start(){this._running=this.run()}done(){return this._running?this._running:Promise.resolve()}async run(){try{for await(const t of this)this.log(t),this.paused&&await this.paused;this.log(this.getState("done!"))}catch(t){this.log(this.getState(t))}}pause(){this.paused||(this.paused=new Promise((t=>{this._unpause=t})))}unpause(){this._unpause&&(this._unpause(),this.paused=null,this._unpause=null)}getState(t,e){return e&&void 0!==this.state[e]&&this.state[e]++,{state:this.state,msg:t}}cleanup(){}}const p=/\s*(\S*\s+[\d.]+[wx]),|(?:\s*,(?:\s+|(?=https?:)))/,y=/(url\s*\(\s*[\\"']*)([^)'"]+)([\\"']*\s*\))/gi,v=/(@import\s*[\\"']*)([^)'";]+)([\\"']*\s*;?)/gi;class b extends f{constructor(t=!1){super(),this.urlSet=new Set,this.urlqueue=[],this.numPending=0,t&&this.start()}async start(){await a(),this.run(),this.initObserver()}done(){return Promise.resolve()}async run(){this.extractSrcSrcSetAll(document),this.extractStyleSheets()}isValidUrl(t){return t&&(t.startsWith("http:")||t.startsWith("https:"))}queueUrl(t){try{t=new URL(t,document.baseURI).href}catch(t){return!1}return!!this.isValidUrl(t)&&(!this.urlSet.has(t)&&(this.urlSet.add(t),this.doFetch(t),!0))}async doFetch(t){if(this.urlqueue.push(t),this.numPending<=12)for(;this.urlqueue.length>0;){const t=this.urlqueue.shift();try{this.numPending++,this.debug("AutoFetching: "+t);const e=await fetch(t,{mode:"no-cors",credentials:"include"});this.debug(`AutoFetch Result ${e.status} for ${t}`),await e.blob()}catch(t){this.debug(t)}this.numPending--}}initObserver(){this.mutobz=new MutationObserver((t=>this.observeChange(t))),this.mutobz.observe(document.documentElement,{characterData:!1,characterDataOldValue:!1,attributes:!0,attributeOldValue:!0,subtree:!0,childList:!0,attributeFilter:["srcset"]})}processChangedNode(t){switch(t.nodeType){case Node.ATTRIBUTE_NODE:"srcset"===t.nodeName&&this.extractSrcSetAttr(t.nodeValue);break;case Node.TEXT_NODE:t.parentNode&&"STYLE"===t.parentNode.tagName&&this.extractStyleText(t.nodeValue);break;case Node.ELEMENT_NODE:t.sheet&&this.extractStyleSheet(t.sheet),this.extractSrcSrcSet(t),setTimeout((()=>this.extractSrcSrcSetAll(t)),1e3)}}observeChange(t){for(const e of t)if(this.processChangedNode(e.target),"childList"===e.type)for(const t of e.addedNodes)this.processChangedNode(t)}extractSrcSrcSetAll(t){const e=t.querySelectorAll("img[srcset], img[data-srcset], img[data-src], video[srcset], video[data-srcset], video[data-src], audio[srcset], audio[data-srcset], audio[data-src], picture > source[srcset], picture > source[data-srcset], picture > source[data-src], video > source[srcset], video > source[data-srcset], video > source[data-src], audio > source[srcset], audio > source[data-srcset], audio > source[data-src]");for(const t of e)this.extractSrcSrcSet(t)}extractSrcSrcSet(t){if(!t||t.nodeType!==Node.ELEMENT_NODE)return void console.warn("No elem to extract from");const e=t.src||t.getAttribute("data-src");e&&this.queueUrl(e);const i=t.srcset||t.getAttribute("data-srcset");i&&this.extractSrcSetAttr(i)}extractSrcSetAttr(t){for(const e of t.split(p))if(e){const t=e.trim().split(" ");this.queueUrl(t[0])}}extractStyleSheets(t){t=t||document;for(const e of t.styleSheets)this.extractStyleSheet(e)}extractStyleSheet(t){let e;try{e=t.cssRules||t.rules}catch(t){return void this.debug("Can't access stylesheet")}for(const t of e)t.type===CSSRule.MEDIA_RULE&&this.extractStyleText(t.cssText)}extractStyleText(t){const e=(t,e,i,s)=>(this.queueUrl(i),e+i+s);t.replace(y,e).replace(v,e)}}class S extends f{constructor(t){super(),this.mediaSet=new Set,this.autofetcher=t,this.promises=[],this.promises.push(new Promise((t=>this._initDone=t))),this.start()}async start(){await a(),this.initObserver();for(const[,t]of document.querySelectorAll("video, audio").entries())this.addMediaWait(t);await s(1e3),this._initDone()}initObserver(){this.mutobz=new MutationObserver((t=>this.observeChange(t))),this.mutobz.observe(document.documentElement,{characterData:!1,characterDataOldValue:!1,attributes:!1,attributeOldValue:!1,subtree:!0,childList:!0})}observeChange(t){for(const e of t)if("childList"===e.type)for(const t of e.addedNodes)t instanceof HTMLMediaElement&&this.addMediaWait(t)}addMediaWait(t){if(this.debug("media: "+t.outerHTML),(t.src&&t.src.startsWith("http:")||t.src.startsWith("https:"))&&!this.mediaSet.has(t.src))return this.debug("fetch media URL: "+t.src),this.mediaSet.add(t.src),void this.autofetcher.queueUrl(t.src);if(t.play){let e;const i=new Promise((t=>{e=t}));this.promises.push(i),t.addEventListener("loadstart",(()=>this.debug("loadstart"))),t.addEventListener("loadeddata",(()=>this.debug("loadeddata"))),t.addEventListener("playing",(()=>{this.debug("playing"),e()})),t.addEventListener("ended",(()=>{this.debug("ended"),e()})),t.addEventListener("paused",(()=>{this.debug("paused"),e()})),t.addEventListener("error",(()=>{this.debug("error"),e()})),t.paused&&(this.debug("generic play event for: "+t.outerHTML),t.muted=!0,t.click(),t.play())}}done(){return Promise.allSettled(this.promises)}}class x extends g{constructor(){super(),this.showMoreQuery="//*[contains(text(), 'show more') or contains(text(), 'Show more')]",this.state={segments:1}}static get name(){return"Autoscroll"}async*[Symbol.asyncIterator](){const t=()=>self.scrollY+self.innerHeight<Math.max(self.document.body.scrollHeight,self.document.body.offsetHeight,self.document.documentElement.clientHeight,self.document.documentElement.scrollHeight,self.document.documentElement.offsetHeight),e={top:200,left:0,behavior:"auto"};let a=null,n=self.document.body.clientHeight;for(;t();)self.document.body.clientHeight>n&&this.state.segments++,n=self.document.body.clientHeight,a||(a=d(this.showMoreQuery)),a&&(r=void 0,(r=a.getBoundingClientRect()).top>=0&&r.left>=0&&r.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&r.right<=(window.innerWidth||document.documentElement.clientWidth))&&(yield this.getState("Clicking 'Show More', awaiting more content"),a.click(),await s(i),await Promise.race([o((()=>self.document.body.clientHeight>n),500),s(3e4)]),a=null),self.scrollBy(e),yield this.getState(`Scrolling down by ${e.top} pixels every 0.2 seconds`),await s(200),await Promise.race([o((()=>t()),200),s(5e3*this.state.segments)]);var r}}class P extends g{static isMatch(){return window.location.href.match(/https:\/\/(www\.)?facebook\.com\//)}static get name(){return"Facebook"}constructor(){super(),this.feedQuery="//div[@role='feed']",this.articleQuery=".//div[@role='article']",this.pageletPostList="//div[@data-pagelet='page']/div[@role='main']//div[@role='main']/div",this.pageletProfilePostList="//div[@data-pagelet='page']//div[@data-pagelet='ProfileTimeline']",this.articleToPostList="//div[@role='article']/../../../../div",this.photosOrVideosQuery=`.//a[(contains(@href, '/photos/') or contains(@href, '/photo/?') or contains(@href, '/videos/')) and (starts-with(@href, '${window.location.origin}/') or starts-with(@href, '/'))]`,this.postQuery=".//a[contains(@href, '/posts/')]",this.extraLabel="//*[starts-with(text(), '+')]",this.nextSlideQuery="//div[@data-name='media-viewer-nav-container']/div[@data-visualcompletion][2]//div[@role='button']",this.closeButtonQuery="//div[@aria-hidden='false']//div[@role='button' and not(@aria-hidden) and @aria-label]",this.commentListQuery=".//ul[(../h3) or (../h4)]",this.commentMoreReplies="./div[2]/div[1]/div[2]/div[@role='button']",this.commentMoreComments="./following-sibling::div/div/div[2][@role='button'][./span/span]",this.viewCommentsQuery=".//h4/..//div[@role='button']",this.photoCommentListQuery="//ul[../h2]",this.firstPhotoThumbnail="//div[@role='main']//div[3]//div[contains(@style, 'border-radius')]//div[contains(@style, 'max-width') and contains(@style, 'min-width')]//a[@role='link']",this.firstVideoThumbnail="//div[@role='main']//div[contains(@style, 'z-index')]/following-sibling::div/div/div/div[last()]//a[contains(@href, '/videos/') and @aria-hidden!='true']",this.firstVideoSimple="//div[@role='main']//a[contains(@href, '/videos/') and @aria-hidden!='true']",this.mainVideoQuery="//div[@data-pagelet='root']//div[@role='dialog']//div[@role='main']//video",this.nextVideo="following::a[contains(@href, '/videos/') and @aria-hidden!='true']",this.isPhotoVideoPage=/^.*facebook\.com\/[^/]+\/(photos|videos)\/.+/,this.isPhotosPage=/^.*facebook\.com\/[^/]+\/photos\/?($|\?)/,this.isVideosPage=/^.*facebook\.com\/[^/]+\/videos\/?($|\?)/,this.extraWindow=null,this.allowNewWindow=!1,this.state={}}async*[Symbol.asyncIterator](){if(yield this.getState("Starting..."),await s(2e3),this.isPhotosPage.exec(window.location.href))return this.state={photos:0,comments:0},void(yield*this.iterPhotoSlideShow());if(this.isVideosPage.exec(window.location.href))return this.state={videos:0,comments:0},void(yield*this.iterAllVideos());if(this.isPhotoVideoPage.exec(window.location.href)){this.state={comments:0};const t=d(this.photoCommentListQuery);yield*this.iterComments(t,1e3)}else this.state={posts:0,comments:0,videos:0},yield*this.iterPostFeeds()}async*iterPostFeeds(){const t=Array.from(u(this.feedQuery));if(t&&t.length)for(const e of t)for await(const t of m(e,i,10*o))yield*this.viewPost(d(this.articleQuery,t));else{const t=d(this.pageletPostList)||d(this.pageletProfilePostList)||d(this.articleToPostList);if(!t)return;for await(const e of m(t,i,10*o))yield*this.viewPost(d(this.articleQuery,e))}this.extraWindow&&this.extraWindow.close()}async*viewPost(t,e=2){if(!t)return;const i=d(this.postQuery,t);let o="";i&&(o=new URL(i.href,window.location.href),o.search=""),yield this.getState("Viewing post "+o,"posts"),t.scrollIntoView(this.scrollOpts),await s(400),d(".//video",t)&&(yield this.getState("Playing inline video","videos"),await s(400));let a=d(this.commentListQuery,t);if(!a){const e=d(this.viewCommentsQuery,t);e&&(e.click(),await s(400)),a=d(this.commentListQuery,t)}yield*this.iterComments(a,e),await s(1e3)}async*viewPhotosOrVideos(t){const e=Array.from(u(this.photosOrVideosQuery,t)),i=new Set;let o=0;for(const t of e){const a=new URL(t.href,window.location.href);if(-1===t.href.indexOf("?fbid")&&(a.search=""),i.has(a.href))continue;const n=t.href.indexOf("/video")>=0?"videos":"photos";++o,i.add(a.href),yield this.getState(`Viewing ${n} ${a.href}`,n),t.scrollIntoView(),await s(1e3),t.click(),await s(2e3),this.allowNewWindow&&await this.openNewWindow(a.href),o===e.length&&(yield*this.viewExtraObjects(t,n,this.allowNewWindow));const r=d(this.closeButtonQuery);r&&(r.click(),await s(400))}}async*viewExtraObjects(t,e,i){const a=d(this.extraLabel,t);if(!a)return;const n=Number(a.innerText.slice(1));if(isNaN(n))return;let r;for(let t=0;t<n;t++){const t=d(this.nextSlideQuery);t&&(r=window.location.href,t.click(),await s(1e3),await o((()=>window.location.href!==r),400),yield this.getState(`Viewing extra ${e} ${window.location.href}`),i&&await this.openNewWindow(window.location.href))}}async openNewWindow(t){this.extraWindow?this.extraWindow.location.href=t:this.extraWindow=await async function(t){if(self.__bx_open){const e=new Promise((t=>self.__bx_openResolve=t));n(self.__bx_open,{url:t});let i=null;try{if(i=await e,i)return i}catch(t){console.warn(t)}finally{delete self.__bx_openResolve}}return window.open(t)}(t)}async*iterComments(t,e=2){if(!t)return void await s(1e3);let i=t.firstElementChild,o=null,a=0;for(;i&&a<e;){for(;i&&a<e;){yield this.getState("Loading comments","comments"),i.scrollIntoView(this.scrollOpts),await s(400);const t=d(this.commentMoreReplies,i);t&&(t.click(),await s(1e3)),o=i,i=o.nextElementSibling,a++}if(a===e)break;let n=d(this.commentMoreComments,t);n&&(n.scrollIntoView(this.scrollOpts),n.click(),await s(1e3),o&&(i=o.nextElementSibling,await s(1e3)))}await s(400)}async*iterPhotoSlideShow(){const t=d(this.firstPhotoThumbnail);if(!t)return;let e=window.location.href;t.scrollIntoView(this.scrollOpts),t.click(),await s(1e3),await o((()=>window.location.href!==e),400);let a=null;for(;(a=d(this.nextSlideQuery))&&(e=window.location.href,await s(i),a.click(),await s(1e3),await Promise.race([o((()=>window.location.href!==e),400),s(3e3)]),window.location.href!==e);){yield this.getState(`Viewing photo ${window.location.href}`,"photos");const t=d(this.photoCommentListQuery);yield*this.iterComments(t,2),await s(1e3)}}async*iterAllVideos(){const t=d("//video");t&&(t.scrollIntoView(this.scrollOpts),await s(1e3));let e=d(this.firstVideoThumbnail)||d(this.firstVideoSimple);if(e)for(;e;){e.scrollIntoView(this.scrollOpts);let t=window.location.href;e.click(),await o((()=>window.location.href!==t),400),yield this.getState("Viewing video: "+window.location.href,"videos"),await s(2e3),await Promise.race([o((()=>{for(const t of u("//video"))if(t.readyState>=3)return!0;return!1}),400),s(2e4)]),await s(2e3);const i=d(this.closeButtonQuery);if(!i)break;t=window.location.href,i.click(),await o((()=>window.location.href!==t),400),e=d(this.nextVideo,e)}}}class E extends g{static isMatch(){return window.location.href.match(/https:\/\/(www\.)?instagram\.com\/\w[\w]+/)}static get name(){return"Instagram"}constructor(){super(),this.state={},this.rootPath="//article/div/div",this.childMatchSelect="string(.//a[starts-with(@href, '/')]/@href)",this.childMatch="child::div[.//a[@href='$1']]",this.firstPostInRow="div[1]/a",this.postCloseButton="/html/body/div[last()]/div[3]/button[.//*[@aria-label]]",this.nextPost="//div[@role='dialog']//a[contains(@class, 'coreSpriteRightPaginationArrow')]",this.postLoading="//*[@aria-label='Loading...']",this.subpostNextOnlyChevron="//article[@role='presentation']//div[@role='presentation']/following-sibling::button",this.subpostPrevNextChevron=this.subpostNextOnlyChevron+"[2]",this.commentRoot="//article/div[3]/div[1]/ul",this.viewReplies="//li//button[span[not(count(*)) and text()!='$1']]",this.loadMore="//button[span[@aria-label]]",this.maxCommentsTime=1e4,this.postOnlyWindow=null,this.state={posts:0,slides:0,rows:0,comments:0}}cleanup(){this.postOnlyWindow&&(this.postOnlyWindow.close(),this.postOnlyWindow=null)}async waitForNext(t){return t?(await s(i),t.nextElementSibling?t.nextElementSibling:null):null}async*iterRow(){let t=d(this.rootPath);if(!t)return;let e=t.firstElementChild;if(e)for(;e;){await s(i);const t=new h(this.childMatchSelect,e);t.matchValue&&(yield e,e=await t.restore(this.rootPath,this.childMatch)),e=await this.waitForNext(e)}}async*viewStandalonePost(t){let e=d(this.rootPath);if(!e||!e.firstElementChild)return;const i=w(this.childMatchSelect,e.firstElementChild);yield this.getState("Loading single post view for first post: "+i),window.history.replaceState({},"",i),window.dispatchEvent(new PopStateEvent("popstate",{state:{}}));let a=null,n=null;await s(1e3),await o((()=>(a=d(this.rootPath))!==e&&a),1e3),await s(1e3),window.history.replaceState({},"",t),window.dispatchEvent(new PopStateEvent("popstate",{state:{}})),await o((()=>(n=d(this.rootPath))!==a&&n),1e3)}async*iterSubposts(){let t=d(this.subpostNextOnlyChevron),e=1;for(;t;)t.click(),await s(1e3),yield this.getState(`Loading Slide ${++e} for ${window.location.href}`,"slides"),t=d(this.subpostPrevNextChevron);await s(1e3)}async iterComments(){const t=d(this.commentRoot);if(!t)return;let e=t.firstElementChild,a=!1,n="";for(;e;){e.scrollIntoView(this.scrollOpts),a=!0;let t=d(this.viewReplies.replace("$1",n),e);for(;t;){const a=t.textContent;t.click(),this.state.comments++,await s(500),await o((()=>a!==t.textContent),i),n=t.textContent,t=d(this.viewReplies.replace("$1",n),e)}if(e.nextElementSibling&&"LI"===e.nextElementSibling.tagName&&!e.nextElementSibling.nextElementSibling){let t=d(this.loadMore,e.nextElementSibling);t&&(t.click(),this.state.comments++,await s(1e3))}e=e.nextElementSibling,await s(500)}return a}async*iterPosts(t){let e=0;for(;t&&++e<=3;)for(t.click(),await s(2e3),yield this.getState("Loading Post: "+window.location.href,"posts"),await fetch(window.location.href),yield*this.iterSubposts(),yield this.getState("Loaded Comments","comments"),await Promise.race([this.iterComments(),s(this.maxCommentsTime)]),t=d(this.nextPost);!t&&d(this.postLoading);)await s(500);await s(1e3)}async*[Symbol.asyncIterator](){const t=window.location.href;for await(const t of this.iterRow()){await s(500);d(this.firstPostInRow,t).click(),await s(2e3);break}yield*this.viewStandalonePost(t);for await(const t of this.iterRow()){t.scrollIntoView(this.scrollOpts),await s(500),yield this.getState("Loading Row","rows");const e=d(this.firstPostInRow,t);yield*this.iterPosts(e);const i=d(this.postCloseButton);i&&i.click(),await s(1e3)}}}class L extends g{static isMatch(){return window.location.href.match(/https:\/\/(www\.)?twitter\.com\//)}static get name(){return"Twitter"}constructor(t=0){super(),this.maxDepth=t||0,this.rootPath="//h1[@role='heading' and @aria-level='1']/following-sibling::div[@aria-label]/*[1]",this.anchorQuery=".//article",this.childMatchSelect="string(.//article//a[starts-with(@href, '/') and @aria-label]/@href)",this.childMatch="child::div[.//a[@href='$1']]",this.expandQuery=".//div[@role='button' and not(@aria-haspopup) and not(@data-testid)]",this.quoteQuery=".//div[@role='blockquote' and @aria-haspopup='false']",this.imageQuery=".//a[@role='link' and starts-with(@href, '/') and contains(@href, '/photo/')]",this.imageFirstNextQuery="//div[@aria-roledescription='carousel']/div[2]/div[1]//div[@role='button']",this.imageNextQuery="//div[@aria-roledescription='carousel']/div[2]/div[2]//div[@role='button']",this.imageCloseQuery="//div[@role='presentation']/div[@role='button' and @aria-label]",this.backButtonQuery="//div[@data-testid='titleContainer']//div[@role='button']",this.progressQuery=".//*[@role='progressbar']",this.promoted=".//div[data-testid='placementTracking']",this.seenTweets=new Set,this.seenMediaTweets=new Set,this.state={tweets:0,images:0,videos:0}}async waitForNext(t){if(!t)return null;if(await s(400),!t.nextElementSibling)return null;for(;d(this.progressQuery,t.nextElementSibling);)await s(i);return t.nextElementSibling}async expandMore(t){const e=d(this.expandQuery,t);if(!e)return t;const o=t.previousElementSibling;for(e.click(),await s(i);d(this.progressQuery,o.nextElementSibling);)await s(i);return t=o.nextElementSibling}async*infScroll(){let t=d(this.rootPath);if(!t)return;let e=t.firstElementChild;if(e)for(;e;){let t=d(this.anchorQuery,e);if(!t&&this.expandQuery&&(e=await this.expandMore(e,this.expandQuery,this.progressQuery),t=d(this.anchorQuery,e)),e&&e.innerText&&e.scrollIntoView(this.scrollOpts),e&&t){await s(i);const o=new h(this.childMatchSelect,e);o.matchValue&&(yield t,e=await o.restore(this.rootPath,this.childMatch))}e=await this.waitForNext(e,this.progressQuery)}}async*mediaPlaying(t){const e=d("(.//video | .//audio)",t);if(!e||e.paused)return;let i="Waiting for media playback";try{const e=new URL(w(this.childMatchSelect,t.parentElement),window.location.origin).href;if(this.seenMediaTweets.has(e))return;i+=" for "+e,this.seenMediaTweets.add(e)}catch(t){console.warn(t)}i+=" to finish...",yield this.getState(i,"videos");const o=new Promise((t=>{e.addEventListener("ended",(()=>t())),e.addEventListener("abort",(()=>t())),e.addEventListener("error",(()=>t())),e.addEventListener("pause",(()=>t()))}));await Promise.race([o,s(6e4)])}async*iterTimeline(t=0){if(!this.seenTweets.has(window.location.href)){yield this.getState("Capturing thread: "+window.location.href,"threads");for await(const e of this.infScroll()){if(d(this.promoted,e))continue;await s(500),yield*this.clickImages(e,t);const i=d(this.quoteQuery,e);i&&(yield*this.clickTweet(i,1e3)),yield*this.mediaPlaying(e),yield*this.clickTweet(e,t),await s(1e3)}}}async*clickImages(t){const e=d(this.imageQuery,t);if(e){const t=new c((()=>e.click()));yield this.getState("Loading Image: "+window.location.href,"images"),await s(1e3);let i=d(this.imageFirstNextQuery),o=window.location.href;for(;i;){if(i.click(),await s(400),window.location.href===o){await s(1e3);break}o=window.location.href,yield this.getState("Loading Image: "+window.location.href,"images"),await s(1e3),i=d(this.imageNextQuery)}await t.goBack(this.imageCloseQuery)}}async*clickTweet(t,e){const o=new c((()=>t.click()));await s(i),o.changed&&(yield this.getState("Capturing Tweet: "+window.location.href,"tweets"),e<this.maxDepth&&!this.seenTweets.has(window.location.href)&&(yield*this.iterTimeline(e+1,this.maxDepth)),this.seenTweets.add(window.location.href),await s(400),await o.goBack(this.backButtonQuery),await s(i))}async*[Symbol.asyncIterator](){yield*this.iterTimeline(0)}}const C=[E,L,P];e=class{constructor(){this.behaviors=[],this.mainBehavior=null,this.inited=!1,this.started=!1,r("Loaded behaviors for: "+self.location.href)}init(t={autofetch:!0,autoplay:!0,autoscroll:!0,siteSpecific:!0}){if(this.inited)return;if(this.inited=!0,!self.window)return;if(this.timeout=t.timeout,void 0!==t.log){let e=t.log;"string"==typeof e&&(e=self[e]),"function"==typeof e?l(e):!1===e&&l(null)}this.autofetch=new b(!!t.autofetch),t.autofetch&&(r("Enable AutoFetcher"),this.behaviors.push(this.autofetch)),t.autoplay&&(r("Enable Autoplay"),this.behaviors.push(new S(this.autofetch)));let e=!1;if(self.window.top===self.window){if(t.siteSpecific)for(const t of C)if(t.isMatch()){r("Loading Site-Specific Behavior: "+t.name),this.mainBehaviorClass=t,this.mainBehavior=new t,e=!0;break}return!e&&t.autoscroll&&(r("Loading Autoscroll"),this.mainBehaviorClass=x,this.mainBehavior=new x),this.mainBehavior?(this.behaviors.push(this.mainBehavior),this.mainBehavior.name):""}}async run(t){if(this.started)return r("Unpasing Site Behavior"),void this.unpause();r("Initing Site Behavior, Awaiting Load"),this.init(t),await a(),r("Running behavior..."),this.mainBehavior&&this.mainBehavior.start(),this.started=!0;let e=Promise.allSettled(this.behaviors.map((t=>t.done())));this.timeout?(r(`Waiting for behaviors to finish or ${this.timeout}ms timeout`),e=Promise.race([e,s(this.timeout)])):r("Waiting for behaviors to finish"),await e,r("All Behaviors Done!"),this.mainBehavior&&this.mainBehaviorClass.cleanup&&this.mainBehavior.cleanup()}pause(){r("Pausing Main Behavior"+this.mainBehaviorClass.name),this.mainBehavior&&this.mainBehavior.pause()}unpause(){r("Unpausing Main Behavior: "+this.mainBehaviorClass.name),this.mainBehavior&&this.mainBehavior.unpause()}doAsyncFetch(t){return r("Queueing Async Fetch Url: "+t),this.autofetch.queueUrl(t)}},self.__bx_behaviors=new e})();