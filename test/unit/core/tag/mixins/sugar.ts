import sugarMixin, { SUGAR_EVENTS } from '../../../../../src/core/tag/mixins/sugar';
import Phase from '../../../../../src/core/tag/phase';
import { camelCase } from '../../../../../src/core/utils';
import suite from '../../../_suite';

suite('Sugar Mixin', ({ expect, spy, sinon }) => {
  describe('sugarMixin()', () => {
    SUGAR_EVENTS.filter(
      (phase) => phase !== Phase.UPDATE && phase !== Phase.UPDATED
    ).forEach((phase) => {
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
      it(`should listen on ${phase} and pass the previous props and state`, () => {
        const handlers = {};
        const on = spy((p, h) => { handlers[p] = h; });
        const eventListener = spy();
        const camelCaseName = camelCase(`on-${phase}`);
        const prevProps = { a: 'b' };
        const prevState = { b: 'c' };
        const nextProps = { a: 'B' };
        const nextState = { b: 'C' };
        const arg = { d: 'e' };
        const tag: any = {
          on,
          one: () => null,
          props: prevProps,
          state: prevState,
          [camelCaseName]: eventListener,
          sugarMixin,
        };

        tag.sugarMixin();
        expect(on).to.be.calledWith(phase, sinon.match.func);

        tag.props = nextProps;
        tag.state = nextState;
        handlers[phase](arg);
        expect(eventListener).to.be.calledWith(prevProps, prevState, arg);
        handlers[phase](arg);
        expect(eventListener).to.be.calledWith(nextProps, nextState, arg);
      });
    });

    it('should not error if the function does not exist on the tag', () => {
      const handlers: any = {};
      const on = spy();
      const tag: any = {
        on: (p, h) => { handlers[p] = h; },
        one: (p, h) => { handlers[p] = h; },
        onMount: true,
        onUpdated: null,
        sugarMixin,
      };

      tag.sugarMixin();

      expect(() => handlers.onBeforeMount()).not.to.throw;
      expect(() => handlers.onMount()).not.to.throw;
      expect(() => handlers.onUpdate()).not.to.throw;
      expect(() => handlers.onUpdated()).not.to.throw;
    });
  });
});
