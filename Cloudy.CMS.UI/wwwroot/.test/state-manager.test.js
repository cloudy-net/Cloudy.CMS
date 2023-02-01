import assert from 'assert';
import { } from './polyfiller.js';
import stateManager from '../data/state-manager.js';
import simpleChangeHandler from '../data/change-handlers/simple-change-handler.js';

describe('state-manager.js', () => {
  describe('simple scenario', () => {
    it('should merge simple change if < 5 min old', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');
      state.changes = [
        { '$type': 'simple', date: Date.now(), path: 'propertyName', value: 'lorem' },
      ];

      stateManager.getOrCreateLatestChange(state, 'simple', 'propertyName');

      assert.equal(state.changes.length, 1);
    });
    it('should not merge simple change if > 5 min old', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');
      state.changes = [
        { '$type': 'simple', date: Date.now() - 1000000, path: 'propertyName', value: 'lorem' },
      ];

      stateManager.getOrCreateLatestChange(state, 'simple', 'propertyName');

      assert.equal(state.changes.length, 2);
    });
    it('should merge block type change if < 5 min old', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');
      state.changes = [
        { '$type': 'blocktype', date: Date.now(), path: 'blockName', value: 'lorem' },
      ];

      stateManager.getOrCreateLatestChange(state, 'blocktype', 'blockName');

      assert.equal(state.changes.length, 1);
    });
    it('should not merge block type change if > 5 min old', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');
      state.changes = [
        { '$type': 'blocktype', date: Date.now() - 1000000, path: 'blockName', value: 'lorem' },
      ];

      stateManager.getOrCreateLatestChange(state, 'blocktype', 'blockName');

      assert.equal(state.changes.length, 2);
    });
  });
  describe('complex scenario', () => {
    it('should not merge simple change if separated by block change', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');
      state.changes = [
        { '$type': 'simple', date: Date.now(), path: 'blockName.propertyName', value: 'lorem' },
        { '$type': 'blocktype', date: Date.now(), path: 'blockName', type: 'ipsum' },
      ];

      stateManager.getOrCreateLatestChange(state, 'simple', 'propertyName');

      assert.equal(state.changes.length, 3);
    });
    it('should not merge simple change if separated by nested block change', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');
      state.changes = [
        { '$type': 'simple', date: Date.now(), path: 'blockName.nestedBlockName.propertyName', value: 'lorem' },
        { '$type': 'blocktype', date: Date.now(), path: 'blockName', type: 'ipsum' },
      ];

      stateManager.getOrCreateLatestChange(state, 'simple', 'blockName.nestedBlockName.propertyName');

      assert.equal(state.changes.length, 3);
    });
    it('should merge block type change if separated by irrelevant simple change', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');
      state.changes = [
        { '$type': 'blocktype', date: Date.now(), path: 'blockName', type: 'ipsum' },
        { '$type': 'simple', date: Date.now(), path: 'propertyName', value: 'lorem' },
      ];

      stateManager.getOrCreateLatestChange(state, 'blocktype', 'blockName');

      assert.equal(state.changes.length, 2);
    });
    it('should not merge block type change if separated by nested simple change', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');
      state.changes = [
        { '$type': 'blocktype', date: Date.now(), path: 'blockName', type: 'ipsum' },
        { '$type': 'simple', date: Date.now(), path: 'blockName.propertyName', value: 'lorem' },
      ];

      stateManager.getOrCreateLatestChange(state, 'blocktype', 'blockName');

      assert.equal(state.changes.length, 3);
    });
  });

  describe('getMergedChanges', () => {
    it('should return changes', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');

      const changes = [
        { '$type': 'simple', date: Date.now(), path: 'property1Name', value: 'lorem' },
        { '$type': 'blocktype', date: Date.now(), path: 'blockName', type: 'ipsum' },
        { '$type': 'simple', date: Date.now(), path: 'blockName.property2Name', value: 'dolor' },
      ]

      state.changes = [...changes];

      const result = stateManager.getMergedChanges(state);

      assert.deepEqual(result, changes);
    });
    it('should not take changes cleared by type change', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');

      const changes = [
        { '$type': 'simple', date: Date.now(), path: 'blockName.propertyName', value: 'lorem' },
        { '$type': 'blocktype', date: Date.now(), path: 'blockName', type: 'ipsum' },
        { '$type': 'simple', date: Date.now(), path: 'blockName.propertyName', value: 'dolor' },
      ]

      state.changes = [...changes];

      const result = stateManager.getMergedChanges(state);

      assert.deepEqual(result, [changes[1], changes[2]]);
    });
    it('should merge changes on same path', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');

      const changes = [
        { '$type': 'simple', date: Date.now(), path: 'blockName.propertyName', value: 'lorem' },
        { '$type': 'simple', date: Date.now(), path: 'blockName.propertyName', value: 'dolor' },
      ]

      state.changes = [...changes];

      const result = stateManager.getMergedChanges(state);

      assert.deepEqual(result, [changes[1]]);
    });
    it('should not return simple changes matching source', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');

      state.source = {
        value: {
          blockName: {
            Value: {
              propertyName: 'lorem'
            }
          }
        }
      };

      const changes = [
        { '$type': 'simple', date: Date.now(), path: 'blockName.propertyName', value: 'lorem' },
      ]

      state.changes = [...changes];

      const result = stateManager.getMergedChanges(state);

      assert.deepEqual(result, []);
    });
    it('should not return block type changes matching source', () => {
      global.localStorage.clear();
      stateManager.states = stateManager.loadStates();
      const state = stateManager.createStateForNewContent('page');

      state.source = {
        value: {
          blockName: {
            Type: 'lorem'
          }
        }
      };

      const changes = [
        { '$type': 'blocktype', date: Date.now(), path: 'blockName', type: 'lorem' },
      ]

      state.changes = [...changes];

      const result = stateManager.getMergedChanges(state);

      assert.deepEqual(result, []);
    });
  });
  describe('getSourceValue', () => {
    it('simple property', async () => {
      const propertyName = 'lorem';
      const propertyValue = 'ipsum';

      const state = {
        source: {
          value: {
            [propertyName]: propertyValue
          }
        }
      };
      assert.equal(stateManager.getSourceValue(state, propertyName), propertyValue);
    });
    it('nested property', async () => {
      const blockName = 'dolor';
      const nestedBlockName = 'dolor';
      const propertyName = 'lorem';
      const propertyValue = 'ipsum';

      const state = {
        source: {
          value: {
            [blockName]: {
              Value: {
                [nestedBlockName]: {
                  Value: {
                    [propertyName]: propertyValue
                  }
                }
              }
            }
          }
        }
      };
      assert.equal(stateManager.getSourceValue(state, `${blockName}.${nestedBlockName}.${propertyName}`), propertyValue);
    });
    it('nested property in null block', async () => {
      const blockName = 'dolor';
      const nestedBlockName = 'dolor';
      const propertyName = 'lorem';
      const propertyValue = null;

      const state = {
        source: {
          value: {
            [blockName]: {
              Value: {
                [nestedBlockName]: null
              }
            }
          }
        }
      };
      assert.equal(stateManager.getSourceValue(state, `${blockName}.${nestedBlockName}.${propertyName}`), propertyValue);
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
        { '$type': 'simple', date: Date.now(), path: [propertyName], value: '' },
      ];

      const result = stateManager.getSourceConflicts(state, changes);

      const expected = [
        { name: propertyName, type: 'deleted' },
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

      const result = stateManager.getSourceConflicts(state, changes);

      const expected = [
        { path: `${blockName}.${propertyName}`, type: 'blockdeleted' },
      ];

      assert.deepEqual(result, expected);
    });
  });
  // describe('discardSourceConflicts', () => {
  //   it('discards only changes with conflicts', async () => {
  //     const propertyName = 'lorem';
  //     const property2Name = 'ipsum';

  //     const state = {
  //       entityReference: {
  //         keyValues: [1]
  //       },
  //       changes: [
  //         { '$type': 'simple', date: Date.now(), path: [propertyName], value: '' },
  //         { '$type': 'simple', date: Date.now(), path: [property2Name], value: '' },
  //       ]
  //     };

  //     stateManager.states.push(state);

  //     const conflicts = [
  //       { name: propertyName, type: 'deleted' },
  //     ];

  //     stateManager.discardSourceConflicts(state, conflicts);

  //     const expected = [
  //       { '$type': 'simple', date: Date.now(), path: [property2Name], value: '' },
  //     ];

  //     const result = stateManager.getState(state.entityReference).changes;

  //     assert.equal(result.length, 1);
  //     result[0].date = expected[0].date;
  //     assert.deepEqual(result, expected);
  //   });
  // });
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

      const result = stateManager.getSourceBlockTypes(source);

      const expected = {
        [blockName]: blockTypeName,
        [`${blockName}.${block2Name}`]: blockType2Name,
      };

      assert.deepEqual(result, expected);
    });
  });
});
