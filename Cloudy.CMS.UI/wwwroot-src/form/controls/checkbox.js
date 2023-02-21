
const Control = ({ name, path, dependencies }) => {
  const { entityReference, state } = dependencies.useContext(dependencies.EntityContext);

  const onchange = event => {
    dependencies.simpleChangeHandler.setValue(entityReference, path, event.target.checked)
  };
  return dependencies.html`<div class="form-check">
      <input
        type="checkbox"
        class="form-check-input"
        id=${dependencies.componentContextProvider.getIndentifier(path)}
        value=${dependencies.simpleChangeHandler.getIntermediateValue(state, path)}
        onInput=${onchange}
      />
    </div>`;
}

export default Control;