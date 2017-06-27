import * as sinon from 'sinon';
import Tag from '../../../../src/core/tag';
import Lifecycle from '../../../../src/core/tag/lifecycle';
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
});
