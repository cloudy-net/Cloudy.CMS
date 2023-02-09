import assert from 'assert';
import { } from './polyfiller.js';
import stateManager from '../data/state-manager.js';
import conflictManager from '../data/conflict-manager.js';

describe('conflict-manager.js', () => {
  describe('getSourceBlockTypes', () => {
    it('gets nested block types', async () => {
      const blockName = 'lorem';
      const blockTypeName = 'ipsum';
      const block2Name = 'dolor';
      const blockType2Name = 'amet';

      const source = {
        [blockName]: {
          Type: blockTypeName,
          Value: {
            [block2Name]: {
              Type: blockType2Name,
              Value: {}
            }
          }
        }
      };

      const result = conflictManager.getSourceBlockTypes(source);

      const expected = {
        [blockName]: blockTypeName,
        [`${blockName}.${block2Name}`]: blockType2Name,
      };

      assert.deepEqual(result, expected);
    });
  });
  describe('getSourceConflicts', () => {
    it('property deleted with pending change', async () => {
      const propertyName = 'lorem';
      const property2Name = 'ipsum';

      const state = {
        source: {
          value: {},
          properties: {
            [propertyName]: { block: false },
            [property2Name]: { block: false },
          }
        },
        newSource: {
          value: {},
          properties: {
          }
        }
      };

      const changes = [
        { '$type': 'simple', date: Date.now(), path: propertyName, value: '' },
      ];

      const result = conflictManager.getSourceConflicts(state, changes);

      const expected = [
        { path: propertyName, type: 'deleted' },
      ];

      assert.deepEqual(result, expected);
    });
    it('block type changed with pending change', async () => {
      const blockName = 'lorem';
      const blockTypeName = 'ipsum';
      const propertyName = 'dolor';
      const blockType2Name = 'amet';
      const propertyValue = 'adipiscing';

      const state = {
        source: {
          value: {
            [blockName]: {
              Type: blockTypeName
            }
          },
          properties: [],
        },
        newSource: {
          value: {
            [blockName]: {
              Type: blockType2Name
            }
          },
          properties: [],
        },
      };

      const changes = [
        { '$type': 'simple', date: Date.now(), path: `${blockName}.${propertyName}`, value: propertyValue },
      ];

      const result = conflictManager.getSourceConflicts(state, changes);

      const expected = [
        { path: `${blockName}.${propertyName}`, type: 'blockdeleted' },
      ];

      assert.deepEqual(result, expected);
    });
    it('changed property conflicts with pending change', async () => {
      const blockName = 'lorem';
      const blockTypeName = 'ipsum';
      const propertyName = 'dolor';
      const property2Name = 'sit';
      const sourceValue = 'amet';
      const newSourceValue = 'adipiscing';
      const newValue = 'elit';
      const source2Value = 'durum';
      const newSource2Value = 'consectetur';
      const new2Value = 'et';

      const state = {
        source: {
          value: {
            [blockName]: {
              Type: blockTypeName,
              Value: {
                [propertyName]: sourceValue,
              }
            },
            [property2Name]: source2Value,
          },
          properties: [],
        },
        newSource: {
          value: {
            [blockName]: {
              Type: blockTypeName,
              Value: {
                [propertyName]: newSourceValue,
              }
            },
            [property2Name]: newSource2Value,
          },
          properties: [],
        },
      };

      const changes = [
        { '$type': 'simple', date: Date.now(), path: `${blockName}.${propertyName}`, value: newValue },
        { '$type': 'simple', date: Date.now(), path: property2Name, value: new2Value },
      ];

      const result = conflictManager.getSourceConflicts(state, changes);

      const expected = [
        { path: property2Name, type: 'pendingchangesourceconflict' },
        { path: `${blockName}.${propertyName}`, type: 'pendingchangesourceconflict' },
      ];

      assert.deepEqual(result, expected);
    });
    it('changed property conflicts with pending change and whole block changed', async () => {
      const blockName = 'lorem';
      const blockTypeName = 'ipsum';
      const blockType2Name = 'salit';
      const propertyName = 'dolor';
      const sourceValue = 'amet';
      const newValue = 'elit';

      const state = {
        source: {
          value: {
            [blockName]: {
              Type: blockTypeName,
              Value: {
                [propertyName]: sourceValue,
              }
            },
          },
          properties: [],
        },
        newSource: {
          value: {
            [blockName]: {
              Type: blockType2Name
            },
          },
          properties: [],
        },
      };

      const changes = [
        { '$type': 'simple', date: Date.now(), path: `${blockName}.${propertyName}`, value: newValue },
      ];

      const result = conflictManager.getSourceConflicts(state, changes);

      const expected = [
        { path: `${blockName}.${propertyName}`, type: 'blockdeleted' },
      ];

      assert.deepEqual(result, expected);
    });
  });
  describe('enumerateSourceProperties', () => {
    it('lists simple and nested properties', async () => {
      const blockName = 'lorem';
      const blockTypeName = 'ipsum';
      const propertyName = 'dolor';
      const property2Name = 'sit';
      const sourceValue = 'amet';
      const source2Value = 'durum';

      const source = {
        [blockName]: {
          Type: blockTypeName,
          Value: {
            [propertyName]: sourceValue,
          }
        },
        [property2Name]: source2Value,
      };

      const result = conflictManager.enumerateSourceProperties(source);

      const expected = [
        property2Name,
        `${blockName}.${propertyName}`,
      ];

      assert.deepEqual(result, expected);
    });
  });
  describe('getAllChangesForPath', () => {
    it('gets all changes for path', async () => {
      const propertyName = 'lorem';
      const property2Name = 'ipsum';

      const state = {
        entityReference: {
          keyValues: [1]
        },
        changes: [
          { '$type': 'simple', date: Date.now() - 2000000, path: propertyName, value: '' },
          { '$type': 'simple', date: Date.now() - 1000000, path: propertyName, value: '' },
          { '$type': 'simple', date: Date.now(), path: property2Name, value: '' },
        ]
      };

      const expected = [
        state.changes[0],
        state.changes[1],
      ];

      const result = conflictManager.getAllChangesForPath(state.changes, propertyName);

      assert.deepEqual(result, expected);
    });
    it('clears changes after block type change', async () => {
      const propertyName = 'lorem';
      const property2Name = 'ipsum';

      const state = {
        entityReference: {
          keyValues: [1]
        },
        changes: [
          { '$type': 'simple', date: Date.now() - 5000000, path: `${propertyName}.${property2Name}`, value: '' },
          { '$type': 'simple', date: Date.now() - 4000000, path: `${propertyName}.${property2Name}`, value: '' },
          { '$type': 'blocktype', date: Date.now() - 3000000, path: propertyName, type: '' },
          { '$type': 'simple', date: Date.now() - 2000000, path: `${propertyName}.${property2Name}`, value: '' },
          { '$type': 'simple', date: Date.now() - 1000000, path: `${propertyName}.${property2Name}`, value: '' },
        ]
      };

      const expected = [
        state.changes[3],
        state.changes[4],
      ];

      const result = conflictManager.getAllChangesForPath(state.changes, `${propertyName}.${property2Name}`);

      assert.deepEqual(result, expected);
    });
  });
  describe('discardSourceConflicts', () => {
    it('discards changes when action is keep-source', async () => {
      const propertyName = 'lorem';
      const property2Name = 'ipsum';

      const state = {
        entityReference: {
          keyValues: [1]
        },
        changes: [
          { '$type': 'simple', date: Date.now() - 2000000, path: propertyName, value: '' },
          { '$type': 'simple', date: Date.now() - 1000000, path: propertyName, value: '' },
          { '$type': 'simple', date: Date.now(), path: property2Name, value: '' },
        ]
      };

      stateManager.states.push(state);

      const actions = {
        [propertyName]: 'keep-source',
      };

      const expected = [
        state.changes[2]
      ];

      conflictManager.discardSourceConflicts(state, [], actions);

      const result = stateManager.getState(state.entityReference).changes;

      assert.deepEqual(result, expected);
    });
    it('discards changes when block is deleted', async () => {
      const blockName = 'lorem';
      const propertyName = 'ipsum';

      const state = {
        entityReference: {
          keyValues: [1]
        },
        changes: [
          { '$type': 'simple', date: Date.now() - 2000000, path: `${blockName}.${propertyName}`, value: '' },
          { '$type': 'simple', date: Date.now() - 1000000, path: `${blockName}.${propertyName}`, value: '' },
        ]
      };

      stateManager.states.push(state);

      const conflicts = [
        { path: `${blockName}.${propertyName}`, type: 'blockdeleted' },
      ];

      const expected = [
      ];

      conflictManager.discardSourceConflicts(state, conflicts, {});

      const result = stateManager.getState(state.entityReference).changes;

      assert.deepEqual(result, expected);
    });
    it('discards changes when property is deleted', async () => {
      const propertyName = 'ipsum';

      const state = {
        entityReference: {
          keyValues: [1]
        },
        changes: [
          { '$type': 'simple', date: Date.now() - 2000000, path: propertyName, value: '' },
          { '$type': 'simple', date: Date.now() - 1000000, path: propertyName, value: '' },
        ]
      };

      stateManager.states.push(state);

      const conflicts = [
        { path: propertyName, type: 'deleted' },
      ];

      const expected = [
      ];

      conflictManager.discardSourceConflicts(state, conflicts, {});

      const result = stateManager.getState(state.entityReference).changes;

      assert.deepEqual(result, expected);
    });
  });
});