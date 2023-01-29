import { html, useContext, useEffect, useRef } from '../../preact-htm/standalone.module.js';
import stateManager from '../../data/state-manager.js';
import EntityContext from '../entity-context.js';
import simpleChangeHandler from '../../data/change-handlers/simple-change-handler.js';


document.addEventListener('click', function ({ target }) {
  if (target.classList.contains('cloudy-ui-form-field-label') && target.nextSibling && target.nextSibling.classList.contains('quill-wrapper')) {
    const editor = target.nextSibling.querySelector('[contenteditable="true"]');
    if (editor) {
      editor.focus();
    }
  }
});

const Control = function ({ name, path }) {
  const { entityReference, state } = useContext(EntityContext);

  const ref = useRef(null);

  useEffect(() => {
    const instance = ref.current;

    if (!this.quill) {
      this.quill = new Quill(instance, {
        theme: 'snow',
        modules: {
          keyboard: {
            bindings: {
              tab: {
                key: 9,
                handler: () => true
              }
            }
          }
        }
      });
    }

    const callback = () => {
      const value = this.quill.root.innerHTML.replace(/^\s*<p\s*>\s*<br\s*\/?>\s*<\/p\s*>\s*$/ig, '');
      this.quill.root.innerHTMLValue = value;
      simpleChangeHandler.setValue(entityReference, path, value);
    };

    this.quill.on('text-change', callback);

    return () => {
      this.quill.off('text-change', callback);
    }
  }, [entityReference]);

  useEffect(() => {
    const value = simpleChangeHandler.getIntermediateValue(state, path) || null;

    if (this.quill.root.innerHTMLValue != value) {
      this.quill.root.innerHTML = this.quill.root.innerHTMLValue = value;
    }
  }, [state]);

  return html`
      <div class="quill-wrapper">
          <div ref=${ref}>
          <//>
      <//>
  `;
}

export default Control;