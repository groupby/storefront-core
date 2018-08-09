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
      testMissingHandler(phase);

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
  });
});
