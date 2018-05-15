import { StoreSections } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import Tag, { TAG_DESC } from '../../../../src/core/tag';
import Phase from '../../../../src/core/tag/phase';
import utils from '../../../../src/core/tag/utils';
import suite from '../../_suite';

suite('TagUtils', ({ expect, spy, stub }) => {
  describe('bindController()', () => {
    it('should create a mixin', () => {
      const clazz: any = () => null;
      const tag: any = { a: 'b' };
      const initSpy = spy();
      const init = function() {
        initSpy(this);
      };
      const convertToMixin = stub(utils, 'convertToMixin').returns(init);

      utils.bindController(tag, clazz);

      expect(convertToMixin).to.be.calledWith(clazz);
      expect(initSpy).to.be.calledWith(tag);
    });

    it('should register init() method callback if provided', () => {
      const init = spy();
      const one = spy();
      const clazz: any = () => null;
      const tag: any = { a: 'b', one, init };
      const convertToMixin = stub(utils, 'convertToMixin').returns(() => null);

      utils.bindController(tag, clazz);

      expect(one).to.be.calledWithExactly(
        Phase.INITIALIZE,
        sinon.match((cb) => {
          cb();
          return expect(init).to.be.called;
        })
      );
    });
  });

  describe('tagDescriptors()', () => {
    it('should return name, view and css', () => {
      const name = 'my-tag';
      const view = '<div></div>';
      const css = 'background-color: red;';
      const clazz: any = { [TAG_DESC]: { metadata: { name }, view, css } };

      expect(utils.tagDescriptors(clazz)).to.eql([name, view, css]);
    });
  });

  describe('setMetadata()', () => {
    it('should set update metadata to newly spread object', () => {
      const tag = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns({ metadata: { c: 'd' } });
      const setDescription = stub(Tag, 'setDescription');

      utils.setMetadata(tag, 'configurable', true);

      expect(getDescription).to.be.calledWithExactly(tag);
      expect(setDescription).to.calledWithExactly(tag, { metadata: { c: 'd', configurable: true } });
    });
  });
});
