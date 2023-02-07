import { html } from '../preact-htm/standalone.module.js';
import FormField from './form-field.js';

const FormFields = ({ fields, error, loading }) => {
  
    let content;
  
    if (error) {
      content = html`
        <div class="alert alert-primary">
          <p>
            There was an error (<code>{error.response.status}{error.response.statusText ? " " + error.response.statusText : ""}</code>)
            loading the entity field types{error.body ? ":" : "."}
          </p>
          {error.body ? <small><pre>{error.body}</pre></small> : ""}
          <p class="mb-0"><button class="btn btn-primary" onClick={() => { setError(null); setTimeout(() => setRetryError(retryError + 1), 500); }}>Reload</button></p>
        </div>
      `;
    }
  
    if (loading) {
      return 'Loading ...';
    }

    return fields.map(field => html`<${FormField} ...${field} path=${field.name} />`)
};

export default FormFields;