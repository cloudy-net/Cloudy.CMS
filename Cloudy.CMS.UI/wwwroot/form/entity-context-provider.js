import { useState, useEffect, html } from '../preact-htm/standalone.module.js';
import EntityContext from "./entity-context.js";
import stateManager from '../data/state-manager.js';

export default ({ entityType, keyValues, children }) => {
  const [entityReference, setEntityReference] = useState();
  const [state, setState] = useState();
  const [sourceConflicts, setSourceConflicts] = useState([]);
  const [mergedChanges, setMergedChanges] = useState([]);

  useEffect(() => {
    let entityReference;

    if (keyValues) {
      entityReference = { entityType, keyValues };
      setEntityReference(entityReference);
      const state = stateManager.createOrUpdateStateForExistingContent(entityReference);
      setState(state);
    } else {
      const state = stateManager.createStateForNewContent(entityType);
      entityReference = state.entityReference;
      setEntityReference(entityReference);
      setState(state);
    }

    const callback = () => setState({ ...stateManager.getState(entityReference) });
    stateManager.onStateChange(entityReference, callback);
    return () => stateManager.offStateChange(entityReference, callback);
  }, [keyValues]);

  useEffect(() => {
    if (!state) {
      setMergedChanges([]);
      return;
    }

    setMergedChanges(stateManager.getMergedChanges(state));
  }, [state]);

  useEffect(() => {
    if (!state) {
      setSourceConflicts([]);
      return;
    }

    if (!mergedChanges.length) {
      setSourceConflicts([]);
      return;
    }

    setSourceConflicts(stateManager.getSourceConflicts(state, mergedChanges));
  }, [state, mergedChanges]);

  return html`<${EntityContext.Provider} value=${{ entityReference, state, mergedChanges, sourceConflicts }}>
    ${entityReference && state && !state.loading && children || 'Loading ...'}
  <//>`;
};