import html from '@src/html-init.js';
import { useContext } from 'preact/hooks';
import EntityContext from './entity-context.js';
import FieldComponentContext from "./field-component-context.js";
import ValidationManager from '../data/validation-manager.js';

const FormField = ({ name, path, label, description, renderChrome, partial, settings, validators, dependencies }) => {
    const fieldComponents = useContext(FieldComponentContext);

    if(!fieldComponents){
        return;
    }
    
    if(!renderChrome){
        return html`<${fieldComponents[partial]} ...${{ name, label, path, settings, dependencies }} />`;
    }

    const { state } = useContext(EntityContext);
    
    return html`<div class=${`mb-3 ${Object.keys(validators).length ? 'needs-validation' : ''} `}>
    <label for=${dependencies.componentContextProvider.getIdentifier(path)} class="form-label">${label} ${state.changes.find(change => change.path == path) ? '*' : null}</label>
    <${fieldComponents[partial]} ...${{ name, label, path, settings, validators, dependencies }} />
    ${ !!description ? html`<small class="form-text text-muted">${description}</small>` : '' }
    ${ Object.keys(validators).filter(v => ValidationManager.isInvalidForPathAndValidator(state.validationResults, path, v)).map(v => html`
        <div class="invalid-feedback">${ validators[v].message }</div>`
    )} 
    </div>`
};

export default FormField;