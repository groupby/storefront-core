import { Events } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import Tag, { ALIAS_DESCRIPTION } from '../../../../src/core/tag';
import Alias from '../../../../src/core/tag/alias';
import Lifecycle from '../../../../src/core/tag/lifecycle';
import suite from '../../_suite';
import Phase = Lifecycle.Phase;

const TAG: any = { parent: {} };

suite('Tag Alias', ({ expect, spy, stub }) => {
  let alias: Alias;

  beforeEach(() => alias = new Alias(<any>{}));

  describe('constructor()', () => {
    let getDescription: sinon.SinonStub;

    beforeEach(() => {
      getDescription = stub(Alias, 'getDescription').returns({});
    });

    it('should set default alias collections', () => {
      const tag: any = {};
      alias = new Alias(tag);

      expect(tag[ALIAS_DESCRIPTION]).to.eq(alias.aliases);
      expect(alias.aliases).to.eql({
        map: {},
        static: [],
        state: [],
        props: [],
        internal: [],
      });
    });

    it('should set parent', () => {
      const parentAliases = { a: 'b' };
      const parent = { map: parentAliases };
      const parentTag = { c: 'd' };
      const tag = <any>{ parent: parentTag };
      getDescription.returns(parent);
      alias = new Alias(tag);

      expect(alias.hasParent).to.be.true;
      expect(alias.parent).to.eq(parent);
      expect(getDescription).to.be.calledWithExactly(parentTag);
    });

    it('should not set parent', () => {
      alias = new Alias(<any>{});

      expect(alias.hasParent).to.be.false;
      expect(alias.parent).to.be.false;
      expect(alias.oldParentAliases).to.be.undefined;
    });
  });

  describe('parentAliases', () => {
    it('should return parent alias map', () => {
      alias.parent = <any>{ map: { a: 'b', c: 'd' }, internal: [] };

      expect(alias.parentAliases).to.eql({ a: 'b', c: 'd' });
    });

    it('should filter parent aliases to exlude internal', () => {
      alias.parent = <any>{ map: { a: 'b', c: 'd', e: 'f' }, internal: ['a', 'e'] };

      expect(alias.parentAliases).to.eql({ c: 'd' });
    });
  });

  describe('attach()', () => {
    it('should listen for lifecycle events', () => {
      const on = spy();
      const trigger = spy();
      alias['tag'] = <any>{ on, trigger };

      alias.attach();

      expect(on).to.have.callCount(4)
        .and.calledWithExactly(Phase.INITIALIZE, alias.onInitialize)
        .and.calledWithExactly(Phase.STATE_FINALIZED, alias.onStateFinalized)
        .and.calledWithExactly(Phase.UPDATE, sinon.match((cb) => {
          cb();
          return expect(trigger).to.be.calledWithExactly(Phase.RECALCULATE_PROPS);
        }))
        .and.calledWithExactly(Phase.UPDATE, alias.onUpdate);
    });
  });

  describe('onInitialize()', () => {
    it('should save current state', () => {
      const state = { a: 'b' };
      alias.inheritAliases = () => expect.fail();
      alias['tag'] = <any>{ state };

      alias.onInitialize();

      expect(alias.oldState).to.eq(state);
    });

    it('should call inheritAliases() if tag has a parent', () => {
      const inheritAliases = alias.inheritAliases = spy();
      alias.hasParent = true;

      alias.onInitialize();

      expect(inheritAliases).to.be.called;
    });

    it('should expose default alias', () => {
      const aliasName = 'myAlias';
      const expose = spy();
      const getMeta = stub(Tag, 'getMeta').returns({ alias: aliasName });
      const tag = alias['tag'] = <any>{ expose };

      alias.onInitialize();

      expect(expose).to.be.calledWithExactly(aliasName);
      expect(getMeta).to.be.calledWithExactly(tag);
    });
  });

  describe('inheritAliases()', () => {
    const parentAliases = { a: 'b' };

    it('should emit discovered parent aliases', () => {
      const emit = alias.emit = spy();
      stub(alias, 'parentAliases').get(() => parentAliases);
      alias.applyAliases = () => null;

      alias.inheritAliases();

      expect(emit).to.be.calledWithExactly('inherited', 'parent', parentAliases);
    });

    it('should apply parent aliases', () => {
      const aliases = alias.aliases = <any>{ map: { c: 'd' } };
      const applyAliases = alias.applyAliases = spy();
      alias.emit = spy();
      stub(alias, 'parentAliases').get(() => parentAliases);

      alias.inheritAliases();

      expect(aliases.map).to.eql({ a: 'b', c: 'd' });
      expect(applyAliases).to.be.calledWithExactly(aliases.map);
    });
  });

  describe('onStateFinalized()', () => {
    it('should update aliases when state has changed', () => {
      const aliasMap = { a: 'b' };
      const updatedAliases = { c: 'd' };
      const updateAliases = alias.updateAliases = spy();
      const updateStateAliases = alias.updateStateAliases = spy(() => updatedAliases);
      alias.aliases = <any>{ map: aliasMap };
      alias.stateAliasesChanged = () => true;

      alias.onStateFinalized();

      expect(updateStateAliases).to.be.calledWithExactly(aliasMap);
      expect(updateAliases).to.be.calledWithExactly(updatedAliases);
    });

    it('should not update aliases when state remains the same', () => {
      alias.updateAliases = () => expect.fail();
      alias.stateAliasesChanged = () => false;

      alias.onStateFinalized();
    });
  });

  describe('onUpdate()', () => {
    it('should not update unchanged aliases', () => {
      alias.aliases = <any>{ props: [], map: {} };
      alias.updateAliases = () => expect.fail();
      alias.parentAliasesChanged = () => false;
      alias.stateAliasesChanged = () => false;

      alias.onUpdate();
    });

    it('should update parent aliases', () => {
      const aliases = { a: 'b' };
      const parentAliases = { c: 'd' };
      const updateParentAliases = alias.updateParentAliases = spy(() => parentAliases);
      const updateAliases = alias.updateAliases = spy();
      alias.aliases = <any>{ props: [], map: aliases };
      alias.parentAliasesChanged = () => true;
      alias.stateAliasesChanged = () => false;

      alias.onUpdate();

      expect(updateParentAliases).to.be.calledWithExactly(aliases);
      expect(updateAliases).to.be.calledWithExactly(parentAliases);
    });

    it('should update state aliases', () => {
      const aliases = { a: 'b' };
      const stateAliases = { c: 'd' };
      const updateStateAliases = alias.updateStateAliases = spy(() => stateAliases);
      const updateAliases = alias.updateAliases = spy();
      alias.aliases = <any>{ props: [], map: aliases };
      alias.parentAliasesChanged = () => false;
      alias.stateAliasesChanged = () => true;

      alias.onUpdate();

      expect(updateStateAliases).to.be.calledWithExactly(aliases);
      expect(updateAliases).to.be.calledWithExactly(stateAliases);
    });

    it('should update props aliases', () => {
      const aliases = { a: 'b' };
      const propsAliases = { c: 'd' };
      const updatePropsAliases = alias.updatePropsAliases = spy(() => propsAliases);
      const updateAliases = alias.updateAliases = spy();
      alias.aliases = <any>{ props: ['a'], map: aliases };
      alias.parentAliasesChanged = () => false;
      alias.stateAliasesChanged = () => false;

      alias.onUpdate();

      expect(updatePropsAliases).to.be.calledWithExactly(aliases);
      expect(updateAliases).to.be.calledWithExactly(propsAliases);
    });

    it('should update all aliases', () => {
      const aliases = { a: 'b' };
      const parentAliases = { c: 'd' };
      const stateAliases = { e: 'f' };
      const propsAliases = { g: 'h' };
      const updateParentAliases = alias.updateParentAliases = spy(() => parentAliases);
      const updateStateAliases = alias.updateStateAliases = spy(() => stateAliases);
      const updatePropsAliases = alias.updatePropsAliases = spy(() => propsAliases);
      const updateAliases = alias.updateAliases = spy();
      alias.aliases = <any>{ props: ['a'], map: aliases };
      alias.parentAliasesChanged = () => true;
      alias.stateAliasesChanged = () => true;

      alias.onUpdate();

      expect(updateParentAliases).to.be.calledWithExactly(aliases);
      expect(updateStateAliases).to.be.calledWithExactly(parentAliases);
      expect(updatePropsAliases).to.be.calledWithExactly(stateAliases);
      expect(updateAliases).to.be.calledWithExactly(propsAliases);
    });
  });

  describe('parentAliasesChanged()', () => {
    it('should return false if no parent', () => {
      alias.hasParent = false;

      expect(alias.parentAliasesChanged()).to.be.false;
    });

    it('should return false if parent aliases unchanged', () => {
      const parentAliases = alias.oldParentAliases = {};
      alias.parent = <any>{ map: parentAliases };
      alias.hasParent = true;

      expect(alias.parentAliasesChanged()).to.be.false;
    });

    it('should return true if parent aliases have', () => {
      alias.oldParentAliases = {};
      alias.parent = <any>{ map: {} };
      alias.hasParent = true;

      expect(alias.parentAliasesChanged()).to.be.true;
    });
  });

  describe('stateAliasesChanged()', () => {
    it('should return false if state unchanged', () => {
      const state = alias.oldState = {};
      alias['tag'] = <any>{ state };

      expect(alias.stateAliasesChanged()).to.be.false;
    });

    it('should return false if no state aliases', () => {
      alias.oldState = {};
      alias['tag'] = <any>{ state: {} };
      alias.aliases = <any>{ state: [] };

      expect(alias.stateAliasesChanged()).to.be.false;
    });

    it('should return true if state aliases and state changed', () => {
      alias.oldState = {};
      alias['tag'] = <any>{ state: {} };
      alias.aliases = <any>{ state: ['a'] };

      expect(alias.stateAliasesChanged()).to.be.true;
    });
  });

  describe('updateParentAliases()', () => {
    it('should emit updated event', () => {
      const parentAliases = { a: 'b' };
      const emit = alias.emit = spy();
      alias.parent = <any>{ map: parentAliases };
      alias.aliases = <any>{ state: [], props: [], static: [] };
      stub(alias, 'parentAliases').get(() => ({}));

      const updated = alias.updateParentAliases({});

      expect(alias.oldParentAliases).to.eq(parentAliases);
      expect(emit).to.be.calledWithExactly('updated', 'parent', parentAliases);
      expect(updated).to.eql({});
    });

    it('should return updated and filtered aliases', () => {
      const parentAliases = { a: 'b' };
      const emit = alias.emit = spy();
      alias.parent = <any>{ map: parentAliases };
      alias.aliases = <any>{ state: ['x'], props: ['y'], static: ['z'] };
      stub(alias, 'parentAliases').get(() => ({}));

      const updated = alias.updateParentAliases({ i: 'j', k: 'l', x: 'm', y: 'n', z: 'o' });

      expect(alias.oldParentAliases).to.eq(parentAliases);
      expect(emit).to.be.calledWithExactly('updated', 'parent', parentAliases);
      expect(updated).to.eql({ x: 'm', y: 'n', z: 'o' });
    });

    it('should include parent aliases', () => {
      const parentAliases = { a: 'b' };
      const computedParentAliases = { c: 'd' };
      alias.emit = spy();
      alias.parent = <any>{ map: parentAliases };
      alias.aliases = <any>{ state: ['x'], props: ['y'], static: ['z'] };
      stub(alias, 'parentAliases').get(() => computedParentAliases);

      const updated = alias.updateParentAliases({});

      expect(updated).to.eql(computedParentAliases);
    });
  });

  describe('updateStateAliases()', () => {
    it('should emit updated event', () => {
      const state = { a: 'b' };
      const emit = alias.emit = spy();
      alias.aliases = <any>{ state: ['c', 'd', 'e'] };
      alias['tag'] = <any>{ state };

      alias.updateStateAliases({});

      expect(emit).to.be.calledWithExactly('updated', 'state', { c: state, d: state, e: state });
    });

    it('should return updated state and set old state', () => {
      const state = { a: 'b' };
      const stateAliases = ['c', 'd', 'e'];
      const build = stub(Alias, 'build').returns({ i: 'j' });
      alias.emit = spy();
      alias.aliases = <any>{ state: stateAliases };
      alias['tag'] = <any>{ state };

      const updated = alias.updateStateAliases({ g: 'h' });

      expect(alias.oldState).to.eq(state);
      expect(updated).to.eql({ g: 'h', i: 'j' });
      expect(build).to.be.calledWithExactly(stateAliases, state);
    });
  });

  describe('updatePropsAliases()', () => {
    it('should emit updated event', () => {
      const props = { a: 'b' };
      const emit = alias.emit = spy();
      alias.aliases = <any>{ props: ['c', 'd', 'e'] };
      alias['tag'] = <any>{ props };

      alias.updatePropsAliases({});

      expect(emit).to.be.calledWithExactly('updated', 'props', { c: props, d: props, e: props });
    });

    it('should return updated state and set old state', () => {
      const props = { a: 'b' };
      const propsAliases = ['c', 'd', 'e'];
      const build = stub(Alias, 'build').returns({ i: 'j' });
      alias.emit = spy();
      alias.aliases = <any>{ props: propsAliases };
      alias['tag'] = <any>{ props };

      const updated = alias.updatePropsAliases({ g: 'h' });

      expect(updated).to.eql({ g: 'h', i: 'j' });
      expect(build).to.be.calledWithExactly(propsAliases, props);
    });
  });

  describe('updateAliases()', () => {
    it('should set aliases', () => {
      const newAliases = { a: 'b' };
      const applyAliases = alias.applyAliases = spy();

      alias.updateAliases(newAliases);

      expect(alias.aliases.map).to.eq(newAliases);
      expect(applyAliases).to.be.calledWithExactly(newAliases);
    });

    it('should emit removed event for removed fields', () => {
      const emit = alias.emit = spy();
      alias.applyAliases = () => null;
      alias.aliases = <any>{ map: { c: 'd', e: 'f', g: 'h' } };
      alias['tag'] = <any>{ $e: 'y', $g: 'z' };

      alias.updateAliases({ a: 'b', c: 'd' });

      expect(emit).to.be.calledWithExactly('removed', '', ['e', 'g']);
      expect(alias['tag']).to.eql({});
    });
  });

  describe('expose()', () => {

  });

  describe('updateAlias()', () => {
    it('should set new aliases', () => {
      alias.aliases = <any>{ map: { a: 'b' } };

      alias.updateAlias('m', 'f');
    });

    it('should override existing aliases', () => {
      alias.aliases = <any>{ map: { b: 'c' } };
      alias['tag'] = <any>{ $b: 'woah' };

      alias.updateAlias('b', 'bd');
    });
  });

  describe('unexpose()', () => {
    it('should add alias to internal array', () => {
      const aliasName = 'abc';
      const internal = [];
      alias.aliases = <any>{ internal };

      alias.unexpose(aliasName);

      expect(internal).to.eql([aliasName]);
    });
  });

  describe('applyAlias()', () => {
    it('should set alias value on tag instance', () => {
      const value = { a: 'b' };
      const tag = alias['tag'] = <any>{};

      alias.applyAlias('a', value);

      expect(tag.$a).to.eq(value);
    });
  });

  describe('applyAliases()', () => {
    it('should call applyAlias() for all aliases', () => {
      const aliases = { a: 'b', c: 'd' };
      const applyAlias = alias.applyAlias = spy();

      alias.applyAliases(aliases);

      expect(applyAlias).to.have.callCount(2)
        .and.calledWithExactly('a', 'b')
        .and.calledWithExactly('c', 'd');
    });
  });

  describe('emit()', () => {
    it('should emit aliasing event', () => {
      const name = 'abc';
      const action = 'add';
      const type = 'state';
      const aliases = { a: 'b' };
      const emit = spy();
      const getMeta = stub(Tag, 'getMeta').returns({ name });
      const tag = alias['tag'] = <any>{ flux: { emit } };

      alias.emit(action, type, aliases);

      expect(emit).to.be.calledWithExactly(Events.TAG_ALIASING, { name, action, type, aliases });
      expect(getMeta).to.be.calledWithExactly(tag);
    });
  });
});
