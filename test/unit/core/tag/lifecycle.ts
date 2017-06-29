import * as sinon from 'sinon';
import Tag from '../../../../src/core/tag';
import Lifecycle, { STYLISH_CLASS, UI_CLASS } from '../../../../src/core/tag/lifecycle';
import TagUtils from '../../../../src/core/tag/utils';
import suite from '../../_suite';

suite('Lifecycle', ({ expect, spy, stub }) => {

  describe('primeTagActions()', () => {
    it('should create actions with metadata factory', () => {
      const name = 'my-tag';
      const origin = 'search';
      const id = 4;
      const rawActions = spy(() => ({}));
      const getMeta = stub(Tag, 'getMeta').returns({ name, origin });

      Lifecycle.primeTagActions(<any>{ flux: { __rawActions: rawActions }, _riot_id: id });

      expect(rawActions).to.be.calledWith(sinon.match((cb) => {
        const meta = cb();

        return expect(meta).to.eql({ tag: { name, origin, id } });
      }));
    });

    it('should wrap actions for easy dispatch', () => {
      const args = ['a', 'b', 'c'];
      const action1 = { d: 'e' };
      const action2 = { f: 'g' };
      const dispatch = spy();
      const actionCreator1 = spy(() => action1);
      const actionCreator2 = spy(() => action2);
      const actions = { action1: actionCreator1, action2: actionCreator2 };
      const tag: any = { flux: { __rawActions: () => actions, store: { dispatch } } };
      const getMeta = stub(Tag, 'getMeta').returns({});

      Lifecycle.primeTagActions(tag);

      expect(tag.actions).to.have.keys('action1', 'action2');

      tag.actions.action1(...args);
      expect(actionCreator1).to.have.been.calledWith(...args);
      expect(dispatch).to.be.calledWith(action1);

      tag.actions.action2(...args);
      expect(actionCreator2).to.have.been.calledWith(...args);
      expect(dispatch).to.be.calledWith(action2);
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
    });
  });
});
