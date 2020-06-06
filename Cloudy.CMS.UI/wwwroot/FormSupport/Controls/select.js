﻿import FieldControl from '../field-control.js';
import ListItem from '../../ListSupport/list-item.js';
import ItemProvider from './select-item-provider.js';
import Blade from '../../blade.js';
import Button from '../../button.js';
//import ContextMenu from '../ContextMenuSupport/context-menu.js';
import List from '../../ListSupport/list.js';
import notificationManager from '../../NotificationSupport/notification-manager.js';
import SelectItemPreview from './select-item-preview.js';
import ContextMenu from '../../ContextMenuSupport/context-menu.js';



/* SELECT CONTROL */

class SelectControl extends FieldControl {
    constructor(fieldModel, value, app, blade) {
        var element = document.createElement('div');
        var empty = document.createElement('cloudy-ui-select-empty');
        var emptyText = document.createElement('cloudy-ui-select-empty-text');
        emptyText.innerText = '(none)';
        empty.append(emptyText);
        element.append(empty);
        var preview = new SelectItemPreview().appendTo(element);
        super(element);

        var update = item => {
            if (!item) {
                preview.element.style.display = 'none';
                empty.style.display = '';

                return;
            }

            preview.element.style.display = '';
            empty.style.display = 'none';

            preview.setImage(item.image);
            preview.setText(item.text);
            preview.setSubText(item.metadata ? Object.entries(item.metadata).map(([name, value]) => `${name.substr(0, 1).toUpperCase()}${name.substr(1)}: ${value}`).join(", ") : null);
        };

        if (value) {
            preview.setText('&nbsp;');
            preview.setSubText('&nbsp;');

            ItemProvider
                .get(fieldModel.descriptor.control.parameters['provider'], fieldModel.descriptor.control.parameters['type'], value)
                .then(item => {
                    if (item) {
                        update(item);
                    }
                });
        } else {
            update();
        }

        var open = () => {
            var list = new ListItemsBlade(app, fieldModel)
                .onSelect(item => {
                    this.triggerChange(item.value);
                    update(item);
                    app.close(list);
                });

            app.openAfter(list, blade);
        };

        new Button('Add').onClick(open).appendTo(empty);

        var menu = new ContextMenu();

        menu.addItem(item => item.setText('Replace').onClick(open));
        menu.addItem(item => item.setText('Clear').onClick(() => { this.triggerChange(null); update(null); }));

        preview.setMenu(menu);
        preview.onClick(() => menu.button.click());

        if (fieldModel.descriptor.isSortable && !fieldModel.descriptor.embeddedFormId) {
            open();
        }

        this.onSet(value => {
            update(value);
        });
    }
}



/* LIST ITEMS BLADE */

class ListItemsBlade extends Blade {
    onSelectCallbacks = [];

    constructor(app, fieldModel) {
        super();

        this.app = app;
        this.name = fieldModel.descriptor.label;
        this.provider = fieldModel.descriptor.control.parameters['provider'];
        this.type = fieldModel.descriptor.control.parameters['type'];
    }

    async open() {
        this.setTitle(`Select ${this.name.substr(0, 1).toLowerCase()}${this.name.substr(1)}`);

        //this.createNew = () => this.app.openAfter(new EditContentBlade(this.app, this.contentType).onComplete(() => update()), this);
        this.setToolbar(new Button('New').setInherit()/*.onClick(this.createNew)*/);

        var list = new List();
        this.setContent(list);

        var update = async () => {
            var items = await ItemProvider.getAll(this.provider, this.type);
            items.forEach(item =>
                list.addItem(listItem => {
                    if (item.image) {
                        listItem.setImage(item.image);
                    }
                    listItem.setText(item.text);
                    var metadata = Object.entries(item.metadata).map(([name, value]) => `${name.substr(0, 1).toUpperCase()}${name.substr(1)}: ${value}`).join(", ");
                    if (metadata) {
                        listItem.setSubText(metadata);
                    }
                    listItem.onClick(() => {
                        listItem.setActive();
                        this.onSelectCallbacks.forEach(callback => callback.apply(this, [item]));
                    });
                })
            );
        };

        update();
    }

    onSelect(callback) {
        this.onSelectCallbacks.push(callback);

        return this;
    }
}

export default SelectControl;