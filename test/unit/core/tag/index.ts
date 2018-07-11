import * as sinon from 'sinon';
import Tag, { TAG_DESC, TAG_META } from '../../../../src/core/tag';
// import Alias from '../../../../src/core/tag/alias';
// import * as aliasing from '../../../../src/core/tag/alias';
// import Lifecycle from '../../../../src/core/tag/lifecycle';
import TagUtils from '../../../../src/core/tag/utils';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('Tag', ({ expect, spy, stub }) => {
  describe('Base Tag', () => {
    let tag: Tag;
    // let tagAlias: Alias;
    let alias: sinon.SinonStub;
    let lifecycleAttach: sinon.SinonStub;
    let attach: sinon.SinonSpy;

    beforeEach(() => {
      // tagAlias = <any>{ attach: (attach = spy()) };
      // alias = stub(aliasing, 'default').returns(tagAlias);
      // lifecycleAttach = stub(Lifecycle, 'attach');
      tag = new Tag();
    });

    describe('set()', () => {
      it('should call update with state directly if state is true', () => {
        const update = (tag.update = spy());

        tag.set(true);

        expect(update).to.be.calledWithExactly(true);
      });

      it('should update the state', () => {
        const update = (tag.update = spy());
        tag.state = { a: 'b' };

        tag.set({ c: 'd' });

        expect(update).to.be.calledWithExactly({ state: { a: 'b', c: 'd' } });
      });
    });

    describe('select()', () => {
      it('should call selector with state and varargs', () => {
        const state = { a: 'b' };
        const args = [{ c: 'd' }, { e: 'f' }];
        const selector = spy();
        tag.flux = <any>{ store: { getState: () => state } };

        tag.select(selector, ...args);

        expect(selector).to.be.calledWithExactly(state, ...args);
      });
    });

    describe('dispatch()', () => {
      it('should dispatch an action to flux.store', () => {
        const dispatch = spy();
        const action: any = { a: 'b' };
        tag.flux = <any>{ store: { dispatch } };

        tag.dispatch(action);

        expect(dispatch).to.be.calledWithExactly(action);
      });
    });

    describe('provide()', () => {
      it('should call aliasing.expose()', () => {
        const name = 'thing1';
        const generator = () => null;

        tag.provide(name, generator);

        expect(Object.keys(tag._provides)).to.include(name);
      });
    });
  });

  describe('create()', () => {
    it('should call riot.tag()', () => {
      const tag = spy();
      const clazz: any = () => null;
      const metadata = { c: 'd' };
      const bindController = stub(TagUtils, 'bindController');
      const readClassDecorators = stub(TagUtils, 'tagDescriptors').returns(['a', 'b']);
      const getDescription = stub(Tag, 'getDescription').returns({ metadata });

      Tag.create({ tag })(clazz);

      expect(readClassDecorators).to.be.calledWithExactly(clazz);
      expect(tag).to.be.calledWithExactly(
        'a',
        'b',
        sinon.match((cb) => {
          const instance = new cb();

          expect(instance[TAG_META]).to.eql(metadata);
          expect(getDescription).to.be.calledWithExactly(clazz);
          return expect(bindController).to.be.calledWithExactly(sinon.match.any, clazz);
        })
      );
    });
  });

  describe('mixin()', () => {
    it('should add properties from app', () => {
      const services = { a: 'b' };
      const config = { c: 'd' };

      const mixin = Tag.mixin(<any>{ services, config });

      expect(mixin.services).to.eq(services);
      expect(mixin.config).to.eq(config);
    });

    // it('should create initialization method', () => {
    //   const tag = {};
    //   const convertToMixin = stub(TagUtils, 'convertToMixin');
    //   const mixin = Tag.mixin(<any>{});
    //
    //   expect(convertToMixin).to.be.calledWithExactly(Tag);
    // });
  });

  describe('getMeta()', () => {
    it('should extract meta', () => {
      const meta = { a: 'b' };
      const tag: any = { [TAG_META]: meta };

      expect(Tag.getMeta(tag)).to.eq(meta);
    });

    it('should have default value', () => {
      expect(Tag.getMeta(<any>{})).to.eql({});
    });
  });

  describe('getDescription()', () => {
    it('should extract description', () => {
      const oldDescription = { a: 'b' };
      const updatedDescription = { c: 'd' };
      const clazz: any = { [TAG_DESC]: oldDescription };
      const setDescription = stub(Tag, 'setDescription').returns(updatedDescription);

      const description = Tag.getDescription(clazz);

      expect(description).to.eq(updatedDescription);
      expect(setDescription).to.be.calledWithExactly(clazz, oldDescription);
    });

    it('should have and set a default value', () => {
      const clazz: any = {};
      const updatedDescription = { a: 'b' };
      const setDescription = stub(Tag, 'setDescription').returns(updatedDescription);

      const description = Tag.getDescription(clazz);

      expect(description).to.eq(updatedDescription);
      expect(setDescription).to.be.calledWithExactly(clazz, { metadata: {} });
    });
  });

  describe('setDescription()', () => {
    it('should update and return description', () => {
      const description: any = { a: 'b' };
      const clazz: any = {};

      expect(Tag.setDescription(clazz, description)).to.eq(description);
      expect(clazz[TAG_DESC]).to.eq(description);
    });
  });
});
