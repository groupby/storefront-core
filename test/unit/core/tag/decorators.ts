import * as sinon from 'sinon';
import Tag from '../../../../src/core/tag';
import Attribute from '../../../../src/core/tag/attribute';
import * as decorators from '../../../../src/core/tag/decorators';
import utils from '../../../../src/core/tag/utils';
import StoreFront from '../../../../src/storefront';
import suite from '../../_suite';

suite('decorators', ({ expect, spy, stub }) => {

  describe('@tag', () => {
    it('should set tag description name and template', () => {
      const name = 'some-tag';
      const template = '<div></div>';
      const tag = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns({ metadata: {} });
      const setDescription = stub(Tag, 'setDescription');
      stub(StoreFront, 'register');

      decorators.tag(name, template)(tag);

      expect(getDescription).to.be.calledWithExactly(tag);
      expect(setDescription).to.be.calledWithExactly(tag, { metadata: { name }, view: template });
    });

    it('should set tag description css', () => {
      const style = 'label { background-color: red; }';
      const setDescription = stub(Tag, 'setDescription');
      const tag = { a: 'b' };
      stub(Tag, 'getDescription').returns({ metadata: {} });
      stub(StoreFront, 'register');

      decorators.tag('', '', style)(tag);

      expect(setDescription).to.be.calledWithExactly(tag, { metadata: { name: '' }, view: '', css: style });
    });

    it('should register resulting tag', () => {
      const name = 'some-tag';
      const tagDef = { a: 'b' };
      const internalRegister = spy();
      const register = stub(StoreFront, 'register').callsFake((cb) => cb(internalRegister));
      stub(Tag, 'getDescription').returns({ metadata: {} });

      decorators.tag(name, '')(tagDef);

      expect(register.called).to.be.true;
      expect(internalRegister).to.be.calledWithExactly(tagDef, name);
    });

    it('should have default view controller', () => {
      const name = 'some-tag';
      const internalRegister = spy();
      stub(StoreFront, 'register').callsFake((cb) => cb(internalRegister));
      stub(Tag, 'getDescription').returns({ metadata: {} });

      decorators.tag(name, '')();

      expect(internalRegister).to.be.calledWithExactly(sinon.match((cb) => {
        return expect(new cb()).to.not.eq(new cb());
      }), name);
    });
  });

  describe('@view', () => {
    it('should register a tag with the default view controller', () => {
      const name = 'some-tag';
      const template = '<div></div>';
      const tag = stub(decorators, 'tag').returns(() => null);

      decorators.view(name, template);

      expect(tag).to.be.calledWithExactly(name, template, undefined);
    });

    it('should also accept css', () => {
      const name = 'some-tag';
      const template = '<div></div>';
      const css = 'font-weight: bold;';
      const tag = stub(decorators, 'tag').returns(() => null);

      decorators.view(name, template, css);

      expect(tag).to.be.calledWithExactly(name, template, css);
    });
  });

  describe('@css', () => {
    it('should set css', () => {
      const style = 'label { background-color: red; }';
      const tag = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns({});
      const setDescription = stub(Tag, 'setDescription');

      decorators.css(style)(tag);

      expect(getDescription).to.be.calledWithExactly(tag);
      expect(setDescription).to.be.calledWithExactly(tag, { css: style });
    });
  });

  describe('@alias', () => {
    it('should call setMetadata()', () => {
      const aliasName = 'myAlias';
      const tag = { a: 'b' };
      const setMetadata = stub(utils, 'setMetadata');

      decorators.alias(aliasName)(tag);

      expect(setMetadata).to.be.calledWithExactly(tag, 'alias', aliasName);
    });
  });

  describe('@origin', () => {
    it('should call setMetadata()', () => {
      const origin = 'moreRefinements';
      const tag = { a: 'b' };
      const setMetadata = stub(utils, 'setMetadata');

      decorators.origin(origin)(tag);

      expect(setMetadata).to.be.calledWithExactly(tag, 'origin', origin);
    });
  });

  describe('@configurable', () => {
    it('should set configurable on tag', () => {
      const tag = { a: 'b' };
      const setMetadata = stub(utils, 'setMetadata');

      decorators.configurable(tag);

      expect(setMetadata).to.be.calledWithExactly(tag, 'configurable', true);
    });
  });
});
