import Tag from '../../../../../src/core/tag';
import provideConsumeMixin, { ProvideConsume } from '../../../../../src/core/tag/mixins/provide-consume';
import Phase from '../../../../../src/core/tag/phase';
import TagUtils from '../../../../../src/core/tag/utils';
import suite from '../../../_suite';

suite('Provide/Consume Mixin', ({ expect, sinon, spy, stub }) => {
  describe('provideConsumeMixin()', () => {
    let tag: any;
    let handlers: Record<string, () => void>;

    function assignHandler(handlerObject: object) {
      return (phase: string, handler: () => void) => (handlerObject[phase] = handler);
    }

    beforeEach(() => {
      handlers = {};
      tag = {
        on: assignHandler(handlers),
        one: assignHandler(handlers),
        provideConsumeMixin,
      };
    });

    it('should assign provided aliases on initialize', () => {
      stub(Tag, 'getMeta')
        .withArgs(tag)
        .returns({ provides: { a: 'b' } });
      tag._provides = { c: 'd' };

      tag.provideConsumeMixin();
      handlers[Phase.INITIALIZE]();

      expect(tag._provides).to.eql({ a: 'b', c: 'd' });
    });

    it('should update aliases on update', () => {
      const updateAliases = stub(ProvideConsume, 'updateAliases');

      tag.provideConsumeMixin();
      handlers[Phase.UPDATE]();

      expect(updateAliases).to.be.calledWith(sinon.match.same(tag));
    });

    it('should remove aliases on unmount', () => {
      const removeAliases = stub(ProvideConsume, 'removeAliases');

      tag.provideConsumeMixin();
      handlers[Phase.UNMOUNT]();

      expect(removeAliases).to.be.calledWith(sinon.match.same(tag));
    });

    describe('alias updating', () => {
      let aliasTagHandlers;
      let aliases;
      let set;
      let off;

      beforeEach(() => {
        aliasTagHandlers = {};
        const on = assignHandler(aliasTagHandlers);
        off = spy();
        aliases = { a: { tag: { on, one: on, off } } };
        set = tag.set = spy();
        stub(ProvideConsume, 'updateAliases')
          .withArgs(tag)
          .returns(aliases);

        tag.provideConsumeMixin();
        handlers[Phase.BEFORE_MOUNT]();
      });

      it('should trigger an update when the providing tag finishes updating', () => {
        aliasTagHandlers[Phase.UPDATED]();

        expect(set).to.be.calledWithExactly(true);
      });

      it('should not trigger an update if the tag has already updated', () => {
        handlers[Phase.UPDATE]();
        aliasTagHandlers[Phase.UPDATED]();

        expect(set).not.to.be.called;
      });

      it('should trigger updates independently for each update cycle', () => {
        // an update is triggered that goes all the way down
        aliasTagHandlers[Phase.UPDATE]();
        handlers[Phase.UPDATE]();
        aliasTagHandlers[Phase.UPDATED]();

        expect(set).not.to.be.called;

        // an update is triggered that stops short of the component
        aliasTagHandlers[Phase.UPDATE]();
        aliasTagHandlers[Phase.UPDATED]();

        expect(set).to.be.called;

        // an update is triggered on the component itself,
        // then an update is triggered on the aliased component,
        // stopping short of the component
        handlers[Phase.UPDATE]();
        aliasTagHandlers[Phase.UPDATE]();
        aliasTagHandlers[Phase.UPDATED]();

        expect(set).to.be.called;
      });

      it('should remove alias event listeners on unmount', () => {
        handlers[Phase.UNMOUNT]();

        expect(off).to.be.calledWith(Phase.UPDATE, aliasTagHandlers[Phase.UPDATE]);
        expect(off).to.be.calledWith(Phase.UPDATED, aliasTagHandlers[Phase.UPDATED]);
      });

      it('should remove alias event listener on alias unmount', () => {
        aliasTagHandlers[Phase.UNMOUNT]();

        expect(off).to.be.calledWithExactly(Phase.UPDATED, aliasTagHandlers[Phase.UPDATED]);
      });
    });
  });

  describe('updateAliases()', () => {
    it('should assign resolved aliases', () => {
      const aliases = { a: { resolve: () => 'b' }, c: { resolve: () => 'd' } };
      const tag: any = { y: 'z' };
      stub(Tag, 'findAliases')
        .withArgs(tag)
        .returns(aliases);
      stub(Tag, 'findConsumes')
        .withArgs(tag)
        .returns(['a', 'c']);
      stub(TagUtils, 'isDebug').returns(false);

      const retval = ProvideConsume.updateAliases(tag);

      expect(tag).to.eql({ $a: 'b', $c: 'd', y: 'z' });
      expect(retval).to.eq(aliases);
    });
  });

  describe('removeAliases()', () => {
    it('should null out each alias', () => {
      const tag: any = { $a: 'b', $c: 'd', y: 'z' };
      stub(Tag, 'findConsumes')
        .withArgs(tag)
        .returns(['a', 'c']);

      ProvideConsume.removeAliases(tag);

      expect(tag).to.eql({ $a: null, $c: null, y: 'z' });
    });
  });
});
