import * as sinon from 'sinon';
import Tag from '../../../../src/core/tag';
import Attribute from '../../../../src/core/tag/attribute';
import * as decorators from '../../../../src/core/tag/decorators';
import StoreFront from '../../../../src/storefront';
import suite from '../../_suite';

suite('decorators', ({ expect, spy, stub }) => {

  describe('@tag', () => {
    it('should set tag description name and template', () => {
      const name = 'some-tag';
      const template = '<div></div>';
      const description: any = { metadata: {} };
      const tagDef = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns(description);
      stub(StoreFront, 'register');

      decorators.tag(name, template)(tagDef);

      expect(description.metadata.name).to.eq(name);
      expect(description.view).to.eq(template);
      expect(getDescription).to.be.calledWith(tagDef);
    });

    it('should set tag description css', () => {
      const style = 'label { background-color: red; }';
      const description: any = { metadata: {} };
      stub(Tag, 'getDescription').returns(description);
      stub(StoreFront, 'register');

      decorators.tag('', '', style)({});

      expect(description.css).to.eq(style);
    });

    it('should register resulting tag', () => {
      const name = 'some-tag';
      const tagDef = { a: 'b' };
      const internalRegister = spy();
      const register = stub(StoreFront, 'register').callsFake((cb) => cb(internalRegister));
      stub(Tag, 'getDescription').returns({ metadata: {} });

      decorators.tag(name, '')(tagDef);

      expect(register.called).to.be.true;
      expect(internalRegister).to.be.calledWith(tagDef, name);
    });

    it('should have default view controller', () => {
      const name = 'some-tag';
      const internalRegister = spy();
      stub(StoreFront, 'register').callsFake((cb) => cb(internalRegister));
      stub(Tag, 'getDescription').returns({ metadata: {} });

      decorators.tag(name, '')();

      expect(internalRegister).to.be.calledWith(sinon.match((cb) => {
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

      expect(tag).to.be.calledWith(name, template);
    });

    it('should also accept css', () => {
      const name = 'some-tag';
      const template = '<div></div>';
      const css = 'font-weight: bold;';
      const tag = stub(decorators, 'tag').returns(() => null);

      decorators.view(name, template, css);

      expect(tag).to.be.calledWith(name, template, css);
    });
  });

  describe('@css', () => {
    it('should set css', () => {
      const description: any = {};
      const style = 'label { background-color: red; }';
      const tag = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns(description);

      decorators.css(style)(tag);

      expect(getDescription).to.be.calledWith(tag);
      expect(description.css).to.eq(style);
    });
  });

  describe('@alias', () => {
    it('should add named alias for tag state', () => {
      const metadata: any = {};
      const aliasName = 'myAlias';
      const tag = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns({ metadata });

      decorators.alias(aliasName)(tag);

      expect(getDescription).to.be.calledWith(tag);
      expect(metadata.alias).to.eq(aliasName);
    });
  });

  describe('@origin', () => {
    it('should add origin name to tag', () => {
      const metadata: any = {};
      const origin = 'moreRefinements';
      const tag = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns({ metadata });

      decorators.origin(origin)(tag);

      expect(getDescription).to.be.calledWith(tag);
      expect(metadata.origin).to.eq(origin);
    });
  });

  describe('@configurable', () => {
    it('should set configurable on tag', () => {
      const metadata: any = {};
      const tag = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns({ metadata });

      decorators.configurable(tag);

      expect(getDescription).to.be.calledWith(tag);
      expect(metadata.configurable).to.be.true;
    });
  });
});
