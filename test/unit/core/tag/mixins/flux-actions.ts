import * as FluxActionsMixin from '../../../../../src/core/tag/mixins/flux-actions';
import suite from '../../../_suite';

suite('Flux Actions Mixin', ({ expect, spy, stub }) => {
  describe('wrapActionCreators()', () => {
    it('should wrap each action creator', () => {
      const meta = { a: 'b' };
      const wrappedActionCreator = { c: 'd' };
      const actionCreator1 = () => null;
      const actionCreator2 = () => null;
      const dispatch = () => null;
      const wrapActionCreator = stub(FluxActionsMixin, 'wrapActionCreator').returns(wrappedActionCreator);

      const actionCreators = FluxActionsMixin.wrapActionCreators(
        { e: actionCreator1, f: actionCreator2 },
        meta,
        dispatch
      );

      expect(actionCreators).to.eql({ e: wrappedActionCreator, f: wrappedActionCreator });
      expect(wrapActionCreator)
        .to.be.calledTwice.and.calledWithExactly(actionCreator1, meta, dispatch)
        .and.calledWithExactly(actionCreator2, meta, dispatch);
    });
  });

  describe('wrapActionCreator()', () => {
    it('should dispatch augmented action', () => {
      const meta = { a: 'b' };
      const dispatched = { c: 'd' };
      const action = { e: 'f' };
      const augmented = { g: 'h' };
      const dispatch = spy(() => dispatched);
      const actionCreator = spy(() => action);
      const augmentAction = stub(FluxActionsMixin, 'augmentAction').returns(augmented);

      const wrappedActionCreator = FluxActionsMixin.wrapActionCreator(actionCreator, meta, dispatch);

      expect(wrappedActionCreator('a', 'b', 'c')).to.eql(dispatched);
      expect(augmentAction).to.be.calledWithExactly(action, meta);
      expect(dispatch).to.be.calledWithExactly(augmented);
    });
  });

  describe('wrapThunk()', () => {
    it('should return augmented action thunk', () => {
      const meta = { a: 'b' };
      const augmented = { c: 'd' };
      const action = { e: 'f' };
      const thunk = spy(() => action);
      const getState = () => null;
      const augmentAction = stub(FluxActionsMixin, 'augmentAction').returns(augmented);

      const wrappedThunk = FluxActionsMixin.wrapThunk(thunk, meta);

      expect(wrappedThunk(getState)).to.eq(augmented);
      expect(augmentAction).to.be.calledWithExactly(action, meta);
      expect(thunk).to.be.calledWithExactly(getState);
    });
  });

  describe('augmentMeta()', () => {
    it('should augment existing metadata', () => {
      const meta = { a: 'b' };

      const action = FluxActionsMixin.augmentMeta(<any>{ meta: { c: 'd' } }, meta);

      expect(action).to.eql({ meta: { a: 'b', c: 'd' } });
    });
  });

  describe('augmentAction()', () => {
    it('should wrap thunk', () => {
      const meta = { a: 'b' };
      const wrapped = { c: 'd' };
      const thunk = () => null;
      const wrapThunk = stub(FluxActionsMixin, 'wrapThunk').returns(wrapped);

      expect(FluxActionsMixin.augmentAction(thunk, meta)).to.eq(wrapped);
      expect(wrapThunk).to.be.calledWithExactly(thunk, meta);
    });

    it('should augment each element of batch action', () => {
      const meta = { a: 'b' };
      const actions: any[] = ['c', 'd'];
      const augmentMeta = stub(FluxActionsMixin, 'augmentMeta');
      augmentMeta.withArgs(actions[0], meta).returns('x');
      augmentMeta.withArgs(actions[1], meta).returns('y');

      expect(FluxActionsMixin.augmentAction(actions, meta)).to.eql(['x', 'y']);
    });

    it('should augment action metadata', () => {
      const meta = { a: 'b' };
      const action: any = { c: 'd' };
      const augmented = { e: 'f' };
      const augmentMeta = stub(FluxActionsMixin, 'augmentMeta').returns(augmented);

      expect(FluxActionsMixin.augmentAction(action, meta)).to.eq(augmented);
      expect(augmentMeta).to.be.calledWithExactly(action, meta);
    });

    it('should return unexpected action types', () => {
      const meta = { a: 'b' };
      const action: any = 77;

      expect(FluxActionsMixin.augmentAction(action, meta)).to.eq(action);
    });
  });
});
