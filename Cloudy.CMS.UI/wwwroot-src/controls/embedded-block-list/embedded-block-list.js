import EmbeddedBlockFields from "../embedded-block/embedded-block-fields";

export default ({ name, path, provider, dependencies, settings: { types } }) => {
  const {
    html,
    useContext,
    EntityContext,
    Dropdown,
    DropdownItem,
  } = dependencies;

  const { entityReference, state } = useContext(EntityContext);

  const items = dependencies.embeddedBlockListHandler.getIntermediateValue(state, path);

  const kebab = html`<svg class="embedded-block-type-kebab" width="18" height="4" viewBox="0 0 18 4" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14" width="4" height="4" rx="2" fill="#ABB0BB"/><rect x="7" width="4" height="4" rx="2" fill="#ABB0BB"/><rect width="4" height="4" rx="2" fill="#ABB0BB"/></svg>`;

  return html`
    <div>
      ${items.map(item => html`
        <fieldset class="embedded-block">
          <legend class="embedded-block-type">
            ${item.type}
            <${Dropdown} contents=${kebab} className="embedded-block-type-button">
              <${DropdownItem} text="Remove" />
            <//>
          <//>
          <${EmbeddedBlockFields} ...${{ type: item.type, path: `${path}.${item.key}`, dependencies }}/>
        <//>
      `)}
    <//>
    <${Dropdown} contents="Add" className="button primary">
      ${types.map(type => dependencies.html`<${DropdownItem} className="dropdown-item" text=${type} onClick=${event => { dependencies.embeddedBlockListHandler.add(entityReference, path, type); dependencies.closeDropdown(event.target); }}><//>`)}
    <//>
  `;
};