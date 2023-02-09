import changeManager from "./change-manager.js";
import stateManager from "./state-manager.js";

class ConflictManager {
  getSourceConflicts(state, mergedChanges) {
    if (!state.newSource) {
      return [];
    }

    const conflicts = [];

    for (let key of Object.keys(state.source.properties)) {
      if (!state.newSource.properties[key] && mergedChanges.find(change => change.path == key)) {
        conflicts.push({ path: key, type: 'deleted' });
      }
    }

    const sourceBlockTypes = this.getSourceBlockTypes(state.source.value);
    const newSourceBlockTypes = this.getSourceBlockTypes(state.newSource.value);

    for (let path of Object.keys(sourceBlockTypes)) {
      if (!newSourceBlockTypes[path] || sourceBlockTypes[path] != newSourceBlockTypes[path]) {
        for (let change of mergedChanges.filter(change => change.path.indexOf(`${path}.`) == 0)) {
          conflicts.push({ path: change.path, type: 'blockdeleted' });
        }
      }
    }

    const newSourceProperties = this.enumerateSourceProperties(state.source.value);

    for (let path of newSourceProperties) {
      const newSourceValue = changeManager.getSourceValue(state.newSource.value, path);
      const sourceValue = changeManager.getSourceValue(state.source.value, path);

      if (newSourceValue == sourceValue) {
        continue;
      }

      if (Array.isArray(newSourceValue) && Array.isArray(sourceValue) && arrayEquals(newSourceValue, sourceValue)) {
        continue;
      }

      if (!mergedChanges.find(change => change.path == path)) {
        continue;
      }

      if (conflicts.find(conflict => conflict.path == path)) {
        continue;
      }

      conflicts.push({ path: path, type: 'pendingchangesourceconflict' });
    }

    return conflicts;
  }

  discardSourceConflicts(state, conflicts, actions) {
    const changes = [...state.changes];

    for (let path of Object.keys(actions)) {
      const action = actions[path];

      if (action != 'keep-source') {
        continue;
      }

      for(let change of this.getAllChangesForPath(changes, path)){
        changes.splice(changes.indexOf(change), 1);
      }
    }

    for(let conflict of conflicts) {
      if(conflict.type != 'blockdeleted' && conflict.type != 'deleted'){
        continue;
      }

      for(let change of this.getAllChangesForPath(changes, conflict.path)){
        changes.splice(changes.indexOf(change), 1);
      }
    }

    state = {
      ...state,
      changes,
      source: state.newSource,
      newSource: null,
    };

    stateManager.replace(state);
  }

  getSourceBlockTypes(source) {
    const cue = [{ target: source, path: '' }];
    const result = {};

    while (cue.length) {
      const { target, path } = cue.shift();

      for (let key of Object.keys(target)) {
        if (!target[key]) {
          continue;
        }

        if (!target[key].Type) {
          continue;
        }

        const currentPath = path + (path ? '.' : '') + key;

        result[currentPath] = target[key].Type;

        if (!target[key].Value) {
          continue;
        }

        cue.push({ target: target[key].Value, path: currentPath });
      }
    }

    return result;
  }

  enumerateSourceProperties(source) {
    const cue = [{ target: source, path: '' }];
    const result = [];

    while (cue.length) {
      const { target, path } = cue.shift();

      for (let key of Object.keys(target)) {
        const currentPath = path + (path ? '.' : '') + key;

        if (!target[key]) {
          result.push(currentPath);
          continue;
        }

        if (!target[key].Type) {
          result.push(currentPath);
          continue;
        }

        if (!target[key].Value) {
          continue;
        }

        cue.push({ target: target[key].Value, path: currentPath });
      }
    }

    return result;
  }

  getAllChangesForPath(changes, path) {
    let result = [];

    for (let c of changes) {
      if (c['$type'] == 'blocktype' && path.indexOf(`${c.path}.`) == 0) {
        result = [];
        continue;
      }
      if (path == c.path) {
        result.push(c);
        continue;
      }
    }

    return result;
  }
}

export default new ConflictManager();