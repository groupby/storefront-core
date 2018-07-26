import Tag from '../../../../../src/core/tag';
import Pure from '../../../../../src/core/tag/mixins/pure';
import Phase from '../../../../../src/core/tag/phase';
import Props from '../../../../../src/core/tag/props';
import TagUtils from '../../../../../src/core/tag/utils';
import suite from '../../../_suite';

suite('Pure Mixin', ({ expect, spy, stub }) => {
  describe('pureMixin()', () => {
    it('should add shouldUpdate', () => {
      const initialThis = { a: 'b', one: () => null, on: () => null };
      const that = <any>Object.assign({}, initialThis);
      const shouldUpdate = () => false;
      stub(Pure, 'shouldUpdate').returns(shouldUpdate);

      Pure.pureMixin(false).bind(that)();

      expect(that).to.eql({ ...initialThis, shouldUpdate });
    });
  });

  describe('shouldUpdate()', () => {
    it('should set up listeners', () => {
      const on = spy();
      const one = spy();
      const prevAliases = { e: 'f' };
      const tag = <any>{ state: { a: 'b' }, props: { c: 'd' }, one, on };
      stub(Pure, 'extractLocalAliases').returns(prevAliases);

      Pure.shouldUpdate(tag, false);

      expect(tag.one).calledWith(Phase.MOUNT);
      expect(tag.on).calledWith(Phase.UPDATED);
    });

    it('should not update when none of aliases, state nor props have been updated', () => {
      const on = spy();
      const one = spy();
      const props = { c: 'd' };
      const prevAliases = { e: 'f' };
      const tag = <any>{ state: { a: 'b' }, props, one, on };
      stub(Pure, 'extractLocalAliases').returns(prevAliases);
      stub(Pure, 'resolveAliases').returns(prevAliases);
      stub(Props, 'buildProps').returns(props);

      const shouldUpdate = Pure.shouldUpdate(tag, false);
      const updatePrev = on.firstCall.args[1];
      updatePrev();
      const shouldBeUpdated = shouldUpdate(null, null);

      expect(shouldBeUpdated).to.be.false;
    });

    it('should update when aliases have updated', () => {
      const on = spy();
      const one = spy();
      const props = { c: 'd' };
      const prevAliases = { e: 'f' };
      const tag = <any>{ state: { a: 'b' }, props, one, on };
      const extractLocalAliases = stub(Pure, 'extractLocalAliases').returns(prevAliases);
      const resolveAliases = stub(Pure, 'resolveAliases').returns({ g: 'h' });
      stub(Props, 'buildProps').returns(props);
      stub(TagUtils, 'isDebug').returns(false);

      const shouldUpdate = Pure.shouldUpdate(tag, false);
      const updatePrev = on.firstCall.args[1];
      updatePrev();
      const shouldBeUpdated = shouldUpdate(null, null);

      expect(extractLocalAliases).to.be.calledWith(tag);
      expect(resolveAliases).to.be.calledWith(tag);
      expect(shouldBeUpdated).to.be.true;
    });

    it('should update when aliases have updated using legacy aliasing', () => {
      const on = spy();
      const one = spy();
      const props = { c: 'd' };
      const prevAliases = { e: 'f' };
      const tag = <any>{ state: { a: 'b' }, props, one, on };
      const extractLocalAliases = stub(Pure, 'extractLocalAliases').returns(prevAliases);
      const resolveAllAliases = stub(Pure, 'resolveAllAliases').returns({ g: 'h' });
      stub(Props, 'buildProps').returns(props);
      stub(TagUtils, 'isDebug').returns(false);

      const shouldUpdate = Pure.shouldUpdate(tag, true);
      const updatePrev = on.firstCall.args[1];
      updatePrev();
      const shouldBeUpdated = shouldUpdate(null, null);

      expect(extractLocalAliases).to.be.calledWith(tag);
      expect(resolveAllAliases).to.be.calledWith(tag);
      expect(shouldBeUpdated).to.be.true;
    });

    it('should force an update when set(true) or update(true) fire, causing stateChange to be true', () => {
      const on = spy();
      const one = spy();
      const props = { c: 'd' };
      const prevAliases = { e: 'f' };
      const tag = <any>{ state: { a: 'b' }, props, one, on };
      const extractLocalAliases = stub(Pure, 'extractLocalAliases').returns(prevAliases);
      const resolveAliases = stub(Pure, 'resolveAliases').returns({ g: 'h' });
      stub(Props, 'buildProps').returns(props);
      stub(TagUtils, 'isDebug').returns(false);

      const shouldUpdate = Pure.shouldUpdate(tag, false);
      const updatePrev = on.firstCall.args[1];
      updatePrev();
      const shouldBeUpdated = shouldUpdate(true, null);

      expect(shouldBeUpdated).to.be.true;
    });

    it('should update when state has updated', () => {
      const on = spy();
      const one = spy();
      const props = { c: 'd' };
      const prevAliases = { e: 'f' };
      const tag = <any>{ state: { a: 'b' }, props, one, on };
      stub(Pure, 'extractLocalAliases').returns(prevAliases);
      stub(Pure, 'resolveAliases').returns(prevAliases);
      stub(Props, 'buildProps').returns(props);
      stub(TagUtils, 'isDebug').returns(false);

      const shouldUpdate = Pure.shouldUpdate(tag, false);
      const updatePrev = on.firstCall.args[1];
      updatePrev();
      const shouldBeUpdated = shouldUpdate({ state: { i: 'j' } }, null);

      expect(shouldBeUpdated).to.be.true;
    });

    it('should update when tag properties have changed', () => {
      const on = spy();
      const one = spy();
      const props = { c: 'd' };
      const prevAliases = { e: 'f' };
      const tag = <any>{ state: { a: 'b' }, props, one, on };
      stub(Pure, 'extractLocalAliases').returns(prevAliases);
      stub(Pure, 'resolveAliases').returns(prevAliases);
      stub(Props, 'buildProps').returns(props);
      stub(TagUtils, 'isDebug').returns(false);

      const shouldUpdate = Pure.shouldUpdate(tag, false);
      const updatePrev = on.firstCall.args[1];
      updatePrev();
      const shouldBeUpdated = shouldUpdate({ i: 1, item: 'item' }, null);

      expect(shouldBeUpdated).to.be.true;
    });

    it('should update when props have updated', () => {
      const on = spy();
      const one = spy();
      const props = { c: 'd' };
      const newProps = { c: 'new' };
      const nextOpts = { _props: newProps };
      const prevAliases = { e: 'f' };
      const tag = <any>{ state: { a: 'b' }, props, one, on };
      const buildProps = stub(Props, 'buildProps').returns(newProps);
      stub(Pure, 'extractLocalAliases').returns(prevAliases);
      stub(Pure, 'resolveAliases').returns(prevAliases);
      stub(TagUtils, 'isDebug').returns(false);

      const shouldUpdate = Pure.shouldUpdate(tag, false);
      const updatePrev = on.firstCall.args[1];
      updatePrev();
      const shouldBeUpdated = shouldUpdate(null, nextOpts);

      expect(buildProps).to.be.calledWith(tag, nextOpts);
      expect(shouldBeUpdated).to.be.true;
    });
  });

  describe('shallowEquals()', () => {
    it('should consider the same object as equal', () => {
      const obj = { a: 'b' };

      expect(Pure.shallowEquals(obj, obj)).to.be.true;
    });

    it('should consider objects with identical key-value pairs as equal', () => {
      const lhs = { a: 'b', c: 'd' };
      const rhs = { a: 'b', c: 'd' };

      expect(Pure.shallowEquals(lhs, rhs)).to.be.true;
    });

    it('should consider objects with different values as not equal', () => {
      const lhs = { a: 'b', c: 'd' };
      const rhs = { a: 'b', c: 'e' };

      expect(Pure.shallowEquals(lhs, rhs)).to.be.false;
    });

    it('should consider objects without identical object references as not equal', () => {
      const lhs = { a: 'b', c: { d: 'e' } };
      const rhs = { a: 'b', c: { d: 'e' } };

      expect(Pure.shallowEquals(lhs, rhs)).to.be.false;
    });

    it('should consider objects with differing properties as not equal', () => {
      const lhs = { a: 'b', c: 'd' };
      const rhs = { a: 'b', e: 'f' };

      expect(Pure.shallowEquals(lhs, rhs)).to.be.false;
    });

    it('should consider objects with extra properties as not equal', () => {
      const lhs = { a: 'b', c: 'd' };
      const rhs = { a: 'b' };

      expect(Pure.shallowEquals(lhs, rhs)).to.be.false;
    });
  });

  describe('composeObject()', () => {
    it('should extract the values for a given keys and make a new object', () => {
      const keys = ['a', 'b', 'c'];
      const obj = { a: 'd', b: 'f', e: 'f' };

      expect(Pure.composeObject(keys, obj)).to.eql({ a: 'd', b: 'f', c: undefined });
    });
  });

  describe('extractLocalAliases()', () => {
    it('should return aliases for a given tag', () => {
      const $alias1 = { a: 'b' };
      const $alias2 = { c: 'd' };
      const tag = <any>{ $alias1, $alias2, $alias4: { e: 'f' } };
      const consumes = ['alias1', 'alias2', 'alias3'];
      stub(Tag, 'findConsumes').returns(consumes);

      expect(Pure.extractLocalAliases(tag)).to.eql({ $alias1, $alias2 });
    });
  });

  describe('resolveAliases()', () => {
    it('should add a $ to all alias keys and return key value paired object', () => {
      const alias1 = { resolve: () => 'b' };
      const alias2 = { resolve: () => 'd' };
      const tag = <any>{};
      const aliases = { alias1, alias2 };
      stub(Tag, 'findAliases').returns(aliases);

      expect(Pure.resolveAliases(tag)).to.eql({ $alias1: alias1.resolve(), $alias2: alias2.resolve() });
    });
  });

  describe('resolveAllAliases()', () => {
    it('should return aliases', () => {
      const aliases = { a: 'b', c: 'd' };
      const tag = <any>{ _aliases: aliases };

      expect(Pure.resolveAllAliases(tag)).to.eql(aliases);
    });

    it('should return an empty object when no aliases are found', () => {
      const tag = <any>{};

      expect(Pure.resolveAllAliases(tag)).to.eql({});
    });
  });
});
