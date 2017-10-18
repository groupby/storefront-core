import { ActionCreators } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import Tag from '../../../../src/core/tag';
import Lifecycle, { STYLISH_CLASS, UI_CLASS } from '../../../../src/core/tag/lifecycle';
import TagUtils from '../../../../src/core/tag/utils';
import suite from '../../_suite';

suite('Lifecycle', ({ expect, spy, stub }) => {

  describe('primeTagActions()', () => {
    it('should wrap actions for easy dispatch', () => {
      const name = 'my-tag';
      const origin = 'search';
      const id = 4;
      const wrappedActionCreators = { a: 'b' };
      const dispatch = spy();
      const getMeta = stub(Tag, 'getMeta').returns({ name, origin });
      const wrapActionCreators = stub(TagUtils, 'wrapActionCreators').returns(wrappedActionCreators);

      const actionCreators = Lifecycle.primeTagActions(<any>{ flux: { store: { dispatch } }, _riot_id: id });

      expect(actionCreators).to.eq(wrappedActionCreators);
      expect(wrapActionCreators).to.be.calledWithExactly(
        ActionCreators,
        { tag: { name, origin, id } },
        sinon.match((cb) => {
          const action = { c: 'd' };
          cb(action);

          return expect(dispatch).to.be.calledWithExactly(action);
        })
      );
    });
  });

  describe('onInitialize()', () => {
    it('should add sugar methods, metadata and actions', () => {
      const tag = { a: 'b', on: () => null };
      const addSugar = stub(Lifecycle, 'addSugar');
      const addMetadata = stub(Lifecycle, 'addMetadata');
      const primeTagActions = stub(Lifecycle, 'primeTagActions');
      stub(Lifecycle, 'onRecalculateProps');

      Lifecycle.onInitialize.call(tag);

      expect(addSugar).to.be.calledWith(tag);
      expect(addMetadata).to.be.calledWith(tag);
      expect(primeTagActions).to.be.calledWith(tag);
    });

    it('should set initial props', () => {
      const tag = { a: 'b', on: () => null };
      const onRecalculateProps = stub(Lifecycle, 'onRecalculateProps');
      stub(Lifecycle, 'addSugar');
      stub(Lifecycle, 'addMetadata');
      stub(Lifecycle, 'primeTagActions');

      Lifecycle.onInitialize.call(tag);

      expect(onRecalculateProps.thisValues[0]).to.eq(tag);
    });

    it('should listen for BEFORE_MOUNT', () => {
      const on = spy();
      const trigger = spy();
      const tag = { a: 'b', on, trigger };
      const onRecalculateProps = stub(Lifecycle, 'onRecalculateProps');
      stub(Lifecycle, 'addSugar');
      stub(Lifecycle, 'addMetadata');
      stub(Lifecycle, 'primeTagActions');

      Lifecycle.onInitialize.call(tag);

      expect(on).to.be.calledWith(Lifecycle.Phase.BEFORE_MOUNT, sinon.match((cb) => {
        cb();

        return expect(trigger).to.be.calledWith(Lifecycle.Phase.STATE_FINALIZED);
      }));
    });
  });

  describe('onBeforeMount()', () => {
    it('should apply storefront gb-stylish class', () => {
      const add = spy();
      const tag = { root: { classList: { add, remove: () => null } }, props: { stylish: true } };

      Lifecycle.onBeforeMount.call(tag);

      expect(add).to.be.calledOnce
        .and.calledWithExactly(STYLISH_CLASS);
    });

    it('should apply storefront gb-ui class', () => {
      const add = spy();
      const tag = { root: { classList: { add, remove: () => null } }, props: { ui: true } };

      Lifecycle.onBeforeMount.call(tag);

      expect(add).to.be.calledOnce
        .and.calledWithExactly(UI_CLASS);
    });
  });

  describe('onRecalculateProps()', () => {
    it('should set props', () => {
      const props = { a: 'b' };
      const tag: any = {};
      const buildProps = stub(TagUtils, 'buildProps').returns(props);

      Lifecycle.onRecalculateProps.call(tag);

      expect(tag.props).to.eq(props);
      expect(buildProps).to.be.calledWith(tag);
    });

    it('should update state if transform exists', () => {
      const props = { a: 'b' };
      const tag: any = { state: { c: 'd' } };
      const transform = () => null;
      const transformProps = stub(Lifecycle, 'transformProps').returns({ e: 'f' });
      const getMeta = stub(Tag, 'getMeta').returns({ transform });
      stub(TagUtils, 'buildProps').returns(props);

      Lifecycle.onRecalculateProps.call(tag);

      expect(tag.state).to.eql({ c: 'd', e: 'f' });
      expect(getMeta).to.be.calledWith(tag);
      expect(transformProps).to.be.calledWithExactly(props, transform);
    });
  });

  describe('transformProps()', () => {
    const props = { a: 'b', c: 'd', e: 'f', m: { n: { o: 'p' } } };

    it('should transform by copying an array of properties', () => {
      expect(Lifecycle.transformProps(props, ['a', 'e'])).to.eql({ a: 'b', e: 'f' });
    });

    it('should transform by copying and renaming properties based on map', () => {
      expect(Lifecycle.transformProps(props, { a: 'g', c: 'z' })).to.eql({ g: 'b', z: 'd' });
    });

    it('should be capable of deep rename', () => {
      expect(Lifecycle.transformProps(props, { 'm.n.o': 'x' })).to.eql({ x: 'p' });
    });

    it('should apply transform function to props', () => {
      const transformed = { g: 'h' };
      const transform = spy(() => transformed);

      expect(Lifecycle.transformProps(props, transform)).to.eq(transformed);
      expect(transform).to.be.calledWith(props);
    });

    it('should return empty object if transform cannot be determined', () => {
      expect(Lifecycle.transformProps(props, <any>true)).to.eql({});
    });
  });
});
