class TagWindow {
    constructor(span) {
        this.span = span;
        this.text = span.innerHTML;
        this.init();
    }

    init() {
        this.span.onclick = this.itemOnClick;
        this.span.ondblclick = this.itemOnDblClick;
    }

    itemOnClick() {
        tag.saveWindow();
        this.className = 'active';
        var window = tag.windowsDict.get(this);
        tag.contentTextare.value = window.text;
    }

    itemOnDblClick() {
        tag.windowsDict.delete(this);
        var parent = this.parentNode;
        parent.removeChild(this);
        parent.children[0].className = 'active';
        tag.contentTextare.value = tag.windowsDict.get(parent.children[0]).text;
    }
}

class Tag {
    constructor(id) {
        this.windowsDict = new Map();
        this.root = null;
        this.contentTextare = null;
        this.addSpan = null;
        this.init(id);
    }

    init(id) {
        this.root = document.querySelector(id);
        console.log(this.root);
        this.contentTextare = this.root.querySelector('#content textarea');
        var itemSpanList = this.root.querySelectorAll('span.windows ul li ');

        for (var i = 0; i < itemSpanList.length; i++) {
            var itemSpan = itemSpanList[i];
            var window = new TagWindow(itemSpan);
            this.windowsDict.set(itemSpan, window);

            if (itemSpan.className == 'active') {
                this.contentTextare.value = window.text;
            }
        }
        this.addSpan = this.root.querySelector('span.add');
        this.addSpan.onclick = this.onAddClick;
    }

    onAddClick() {
        tag.saveWindow();
        var newLi = document.createElement('li');
        var newSpan = document.createElement('span');
        newSpan.innerText = '新增';
        newLi.appendChild(newSpan);
        var newWindow = new TagWindow(newLi);
        tag.windowsDict.set(newLi, newWindow);

        var ul = tag.root.querySelector('span.windows ul');
        ul.appendChild(newLi);
        newLi.className = 'active';
        tag.contentTextare.value = newWindow.text;
    }

    saveWindow() {
        var activeSpan = tag.root.querySelector('li.active');
        var activeWindow = tag.windowsDict.get(activeSpan);
        activeWindow.text = tag.contentTextare.value;
        activeSpan.className = '';
    }
}

var tag = new Tag('#tag');
