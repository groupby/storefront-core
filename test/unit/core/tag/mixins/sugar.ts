import sugarMixin, { SUGAR_EVENTS } from '../../../../../src/core/tag/mixins/sugar';
import Phase from '../../../../../src/core/tag/phase';
import { camelCase } from '../../../../../src/core/utils';
import suite from '../../../_suite';

suite('Sugar Mixin', ({ expect, spy, sinon }) => {
  function testMissingHandler(phase: string) {
    it(`should not error if the ${phase} handler does not exist on the tag`, () => {
      let handler;
      const assignHandler = (p, h) => {
        if (p === phase) {
          handler = h;
        }
      };
      const tag: any = {
        on: assignHandler,
        one: assignHandler,
        sugarMixin,
      };

      tag.sugarMixin();

      expect(handler).not.to.throw;
    });
  }

  describe('sugarMixin()', () => {
    SUGAR_EVENTS.filter(
      (phase) => phase !== Phase.UPDATE && phase !== Phase.UPDATED
    ).forEach((phase) => {
      testMissingHandler(phase);

      it(`should listen once for ${phase}`, () => {
        const handlers = {};
        const one = spy((p, h) => { handlers[p] = h; });
        const eventListener = spy();
        const camelCaseName = camelCase(`on-${phase}`);
        const arg = { a: 'b' };
        const tag: any = {
          one,
          on: () => null,
          [camelCaseName]: eventListener,
          sugarMixin,
        };

        tag.sugarMixin();
        handlers[phase](arg);

        expect(one).to.be.calledWith(phase, sinon.match.func);
        expect(eventListener).to.be.calledWith(arg);
      });
    });

    [Phase.UPDATE, Phase.UPDATED].forEach((phase) => {
      testMissingHandler(Phase.UPDATE);

      it(`should listen on update and pass the previous props and state`, () => {
        const handlers: any = {};
        const assignHandler = (p, h) => { handlers[p] = h; };
        const on = spy(assignHandler);
        const eventListener = spy();
        const camelCaseName = camelCase(`on-${phase}`);
        const prevProps = { a: 'b' };
        const prevState = { b: 'c' };
        const nextProps = { a: 'B' };
        const nextState = { b: 'C' };
        const arg = { d: 'e' };
        const tag: any = {
          on,
          one: assignHandler,
          props: prevProps,
          state: prevState,
          [camelCaseName]: eventListener,
          sugarMixin,
        };

        tag.sugarMixin();
        expect(on).to.be.calledWith(phase, sinon.match.func);

        handlers['before-mount']();
        tag.props = nextProps;
        tag.state = nextState;
        handlers[phase](arg);
        expect(eventListener).to.be.calledWith(prevProps, prevState, arg);
      });
    });

    it('should save a shallow clone of the previous props and state on before-mount and updated', () => {
      const phase = Phase.UPDATED;
      const handlers: any = {};
      const assignHandler = (p, h) => { handlers[p] = h; };
      const eventListener = spy();
      const camelCaseName = camelCase(`on-${phase}`);
      const prevProps = { a: 'b' };
      const prevState = { b: 'c' };
      const nextProps = { a: 'B' };
      const nextState = { b: 'C' };
      const arg = { d: 'e' };
      const tag: any = {
        on: assignHandler,
        one: assignHandler,
        props: prevProps,
        state: prevState,
        [camelCaseName]: eventListener,
        sugarMixin,
      };

      tag.sugarMixin();

      handlers['before-mount']();
      tag.props = nextProps;
      tag.state = nextState;
      handlers[phase](arg);
      expect(eventListener).to.be.calledWith(prevProps, prevState, arg);
      expect(eventListener.firstCall.args[0]).not.to.eq(prevProps);
      expect(eventListener.firstCall.args[1]).not.to.eq(prevState);

      handlers[phase](arg);
      expect(eventListener).to.be.calledWith(nextProps, nextState, arg);
      expect(eventListener.secondCall.args[0]).not.to.eq(nextProps);
      expect(eventListener.secondCall.args[1]).not.to.eq(nextState);
    });
  });
});
