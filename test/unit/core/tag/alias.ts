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
});
