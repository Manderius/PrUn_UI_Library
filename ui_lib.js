const UI = (function () {
    const _bufferSelector = '.N32GL8CJBOw3-rNx0PBZkQ\\=\\=';
    const _emptyBufferInputSelector = '.UoOoh9EGx7YihezkSGeV2Q\\=\\=';
    const _newBufferButtonSelector = '#TOUR_TARGET_BUTTON_BUFFER_NEW';
    const _sidebarSelector = '.YE9MEC2Vi3-XUSvyJ4MGcA\\=\\=';

    let ADDON = {};

    //#region Misc

    ADDON.createYellowButton = (text, onClick, style = "") => {
        const result = `<button class="kgGsDNvDoWj61w4I7VAlfA== fMW62cERnlzxZPFhnlPOeQ==" style="${style}">${text}</button>`;
        let node = createNode(result);
        node.onclick = onClick;
        return node;
    }

    createNode = (htmlString) => {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
      }

    //#endregion

    //#region Screen bar

    ADDON.TOP_BAR = {}

    ADDON.TOP_BAR.addButton = (text, onClick) => {
        const navbar = getTopBar();
        const navbarItemClassList = navbar.children[2].classList;
        const nbitMainCL = navbar.children[2].children[0].classList;
        const nbitUnderlineCL = navbar.children[2].children[1].classList;
        const button = `<div class="${navbarItemClassList}">
                        <span class="${nbitMainCL}" onclick="${onClick}">${text}</span>
                        <div class="${nbitUnderlineCL}"></div>
                    </div>`;
        const node = createNode(button);
        node.children[0].onclick = onClick;
        navbar.appendChild(node);
    }

    class ScreenInfo {
        Name;
        Link;

        constructor(name, link) {
            this.Name = name;
            this.Link = link;
        }
    }

    ADDON.getScreens = () => {
        const navbar = getTopBar();
        var menuUl = navbar.children[1].children[1];
        var screens = [];
        menuUl.childNodes.forEach((cn) => {if (cn.children.length === 4) screens.push(new ScreenInfo(cn.children[1].innerHTML, cn.children[1].href ))});
        return screens;
    }

    getTopBar = () => {
        return document.getElementById('TOUR_TARGET_SCREEN_CONTROLS');
    }

    ADDON.getCurrentScreenName = () => {
        return getTopBar().children[0].children[0].children[0].innerHTML.toUpperCase();
    }

    //#endregion

    //#region Buffers

    class Buffer {
        title;
        command;
        element;

        constructor(element) {
            this.element = element;
            this.title = element.children[0].children[0].innerHTML.toUpperCase();
            this.command = element.children[0].children[1].innerHTML.toUpperCase().split(" ");
        }

        getQuickButtonBar() {
            const bar = this.element.children[1];
            return bar.className === 'oZS0zPcv8BY8OKGjLs2R-Q==' ? bar : null;
        }

        addQuickButton(shortBoldText, shortNormalText, longText, onClick) {
            let bar = this.getQuickButtonBar();
            if (bar === null) {
                bar = createNode(`<div class="oZS0zPcv8BY8OKGjLs2R-Q=="></div>`);
                this.element.insertBefore(bar, this.element.children[1]);
            }
            bar.appendChild(this.#createQuickRowButton(shortBoldText, shortNormalText, longText, onClick));
        }

        #createQuickRowButton(shortTextBold, shortTextNormal, longText, command) {
            const template = `<div class="MApcsYEd7+wqIJTfbHP1yA== fTT52i+1oFauxHOjVfGTww== kWTH1-HkYCWeYyDRgZ7ozQ==">
                                  <span><span class="D+GJhIGmC2eFk59dvrY+Sg==">{{:shortBold}}</span>
                                      {{:shortNormal}}</span><span class="cKqzEDeyKbzb9nPry0Dkfw==">: {{:longText}}
                                  </span>
                             </div>`;
            let result = template.replace("{{:shortBold}}", shortTextBold)
                                 .replace("{{:shortNormal}}", shortTextNormal)
                                 .replace("{{:longText}}", longText);
            let node = createNode(result);
            node.onclick = () => { command(); };
            return node;
        }
    }
    ADDON.Buffer = Buffer;

    ADDON.onBufferCreated = (command, callback) => {
        onBufferCreatedInternal(command, callback, false);
    }

    ADDON.onBufferCreatedOnce = (command, callback) => {
        onBufferCreatedInternal(command, callback, true);
    }

    onBufferCreatedInternal = (command, callback, once) => {
        command = command.toUpperCase();
        const checkCommand = (buffer) => {
            const buff = new Buffer(buffer.parentElement);
            if (buff.command[0] == command) callback(buff);
        }
        ADDON.onElementCreated(_bufferSelector, checkCommand, once);
    }

    changeValue = (input, value) => {
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(input, value);
        var inputEvent = new Event("input", { bubbles: true });
        input.dispatchEvent(inputEvent);
    }

    ADDON.showBuffer = (command) => {
        const addSubmitCommand = (input, cmd) => {
            changeValue(input, cmd);
            input.parentElement.parentElement.requestSubmit();
        }
    
        // Watch for future buffer creation
        ADDON.onElementCreated(_emptyBufferInputSelector, (elem) => addSubmitCommand(elem, command));
    
        // Create new Buffer
        document.querySelector(_newBufferButtonSelector).click();
    }

    //#endregion

    //#region Monitoring

    ADDON.onElementCreated = (selector, callback, onlyOnce = true) => {
        const getElementsFromNodes = (nodes) => Array.from(nodes).flatMap(node => node.nodeType === 3 ? null : Array.from(node.querySelectorAll(selector))).filter(item => item !== null);
        let onMutationsObserved = function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    var elements = getElementsFromNodes(mutation.addedNodes);
                    for (var i = 0, len = elements.length; i < len; i++) {
                        callback(elements[i]);
                        if (onlyOnce) observer.disconnect();
                    }
                }
            });
        };
    
        let containerSelector = 'body';
        let target = document.querySelector(containerSelector);
        let config = { childList: true, subtree: true };
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        let observer = new MutationObserver(onMutationsObserved);
        observer.observe(target, config);
    }

    onLoadingFinished = (callback) => {
        const loadingClass = 'iydywTEIjthCtOf0nolVCQ==';
        const mainScreenSelector = '.iLYgW2DL8rdUwe0ONYO1Mg\\=\\=';
        let onMutationsObserved = function(mutations) {
            const wasRemoved = mutations[0].oldValue.split(/\s+/).includes(loadingClass);
            if (wasRemoved && document.querySelector(mainScreenSelector) !== null) {
                observer.disconnect();
                window.requestIdleCallback(() => callback(), {timeout: 1});
            }
        };
    
        let logoSelector = '.JWoFGgEPrdT6JShoeS0\\+Ag\\=\\=';
        let target = document.querySelector(logoSelector);
        let config = { attributes: true, attributeFilter: ['class'], attributeOldValue: true };
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        let observer = new MutationObserver(onMutationsObserved);
        observer.observe(target, config);
    }

    //#endregion

    //#region Events

    ADDON.onApexLoaded = (callback) => {
        onLoadingFinished(callback);
    }

    //#endregion

    return ADDON;
})();
