const UI = (function () {
    // Bbuffer header row
    const _bufferSelector = ".TileFrame__header___R4a5yN4";
    // Empty buffer input element
    const _emptyBufferInputSelector = ".PanelSelector__input___wUstHrO";
    const _newBufferButtonSelector = "#TOUR_TARGET_BUTTON_BUFFER_NEW";

    let ADDON = {};

    //#region Misc

    ADDON.createYellowButton = (text, onClick, style = "") => {
        const result = `<button class="Button__primary____lObPiw Button__btn___UJGZ1b7" style="${style}">${text}</button>`;
        let node = createNode(result);
        node.onclick = onClick;
        return node;
    };

    const createNode = (htmlString) => {
        var div = document.createElement("div");
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    };

    //#endregion

    //#region Screen bar

    ADDON.TOP_BAR = {};

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
    };

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
        menuUl.childNodes.forEach((cn) => {
            if (cn.children.length === 4) {
                screens.push(
                    new ScreenInfo(
                        cn.children[1].innerHTML,
                        cn.children[1].href
                    )
                );
            }
        });
        return screens;
    };

    const getTopBar = () => {
        return document.getElementById("TOUR_TARGET_SCREEN_CONTROLS");
    };

    ADDON.getCurrentScreenName = () => {
        return getTopBar().children[0].children[0].children[0].innerHTML.toUpperCase();
    };

    //#endregion

    //#region Buffers

    class Buffer {
        title;
        command;
        element;

        // Quick buttons bar, direct parent of buttons
        #contextControlsSelector = ".ContextControls__container___dzDODeW";

        constructor(element) {
            this.element = element;
            this.title =
                element.children[0].children[0].innerHTML.toUpperCase();
            this.command = element.children[0].children[1].innerHTML
                .toUpperCase()
                .split(" ");
        }

        getQuickButtonBar() {
            const bar = this.element.children[1];
            return bar.className === this.#contextControlsSelector ? bar : null;
        }

        addQuickButton(shortBoldText, shortNormalText, longText, onClick) {
            let bar = this.getQuickButtonBar();
            if (bar === null) {
                bar = createNode(
                    `<div class="${this.#contextControlsSelector}"></div>`
                );
                this.element.insertBefore(bar, this.element.children[1]);
            }
            bar.appendChild(
                this.#createQuickRowButton(
                    shortBoldText,
                    shortNormalText,
                    longText,
                    onClick
                )
            );
        }

        #createQuickRowButton(
            shortTextBold,
            shortTextNormal,
            longText,
            command
        ) {
            const template = `<div class="ContextControls__item____QDkFMH fonts__font-regular___Sxp1xjo type__type-small___pMQhMQO">
                                  <span><span class="ContextControls__cmd___BXQDTL_">{{:shortBold}}</span>
                                      {{:shortNormal}}</span><span class="ContextControls__label___xomE3De">: {{:longText}}
                                  </span>
                             </div>`;
            let result = template
                .replace("{{:shortBold}}", shortTextBold)
                .replace("{{:shortNormal}}", shortTextNormal)
                .replace("{{:longText}}", longText);
            let node = createNode(result);
            node.onclick = () => {
                command();
            };
            return node;
        }
    }
    ADDON.Buffer = Buffer;

    ADDON.onBufferCreated = (command, callback) => {
        onBufferCreatedInternal(command, callback, false);
    };

    ADDON.onBufferCreatedOnce = (command, callback) => {
        onBufferCreatedInternal(command, callback, true);
    };

    const onBufferCreatedInternal = (command, callback, once) => {
        command = command.toUpperCase();
        const checkCommand = (buffer) => {
            const buff = new Buffer(buffer.parentElement);
            if (buff.command[0] == command) callback(buff);
        };
        ADDON.onElementCreated(_bufferSelector, checkCommand, once);
    };

    const changeValue = (input, value) => {
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
        ).set;
        nativeInputValueSetter.call(input, value);
        var inputEvent = new Event("input", { bubbles: true });
        input.dispatchEvent(inputEvent);
    };

    ADDON.showBuffer = (command) => {
        const addSubmitCommand = (input, cmd) => {
            changeValue(input, cmd);
            input.parentElement.parentElement.requestSubmit();
        };

        // Watch for future buffer creation
        ADDON.onElementCreated(_emptyBufferInputSelector, (elem) =>
            addSubmitCommand(elem, command)
        );

        // Create new Buffer
        document.querySelector(_newBufferButtonSelector).click();
    };

    //#endregion

    //#region Monitoring

    ADDON.onElementCreated = (selector, callback, onlyOnce = true) => {
        const getElementsFromNodes = (nodes) =>
            Array.from(nodes)
                .flatMap((node) =>
                    node.nodeType === 3
                        ? null
                        : Array.from(node.querySelectorAll(selector))
                )
                .filter((item) => item !== null);
        let onMutationsObserved = function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    var elements = getElementsFromNodes(mutation.addedNodes);
                    for (var i = 0, len = elements.length; i < len; i++) {
                        callback(elements[i]);
                        if (onlyOnce) observer.disconnect();
                    }
                }
            });
        };

        let containerSelector = "body";
        let target = document.querySelector(containerSelector);
        let config = { childList: true, subtree: true };
        let MutationObserver =
            window.MutationObserver || window.WebKitMutationObserver;
        let observer = new MutationObserver(onMutationsObserved);
        observer.observe(target, config);
    };

    const onLoadingFinished = (callback) => {
        // Top left logo's loading class
        const loadingClass = "Frame__logoLoading___L318iNt";
        // Main screen selector, between header bar and footer bar
        const mainScreenSelector = ".Frame__main___Psr0SIB";
        let onMutationsObserved = function (mutations) {
            const wasRemoved = mutations[0].oldValue
                .split(/\s+/)
                .includes(loadingClass);
            if (
                wasRemoved &&
                document.querySelector(mainScreenSelector) !== null
            ) {
                observer.disconnect();
                window.requestIdleCallback(callback, { timeout: 1 });
            }
        };

        // Top left logo
        let logoSelector = ".Frame__logo___qu6xPzo";
        let target = document.querySelector(logoSelector);
        let config = {
            attributes: true,
            attributeFilter: ["class"],
            attributeOldValue: true,
        };
        let MutationObserver =
            window.MutationObserver || window.WebKitMutationObserver;
        let observer = new MutationObserver(onMutationsObserved);
        observer.observe(target, config);
    };

    //#endregion

    //#region Events

    ADDON.onApexLoaded = (callback) => {
        onLoadingFinished(callback);
    };

    //#endregion

    return ADDON;
})();
