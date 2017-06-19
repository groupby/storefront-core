import * as sinon from 'sinon';
import * as decorators from '../../../src/core/decorators';
import StoreFront from '../../../src/storefront';
import Tag from '../../../src/tag';
import Attribute from '../../../src/tag/attribute';
import suite from '../_suite';

suite('decorators', ({ expect, spy, stub }) => {

  describe('@tag', () => {
    it('should set tag description name and template', () => {
      const name = 'some-tag';
      const template = '<div></div>';
      const description: any = {};
      const tagDef = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns(description);
      StoreFront.register = () => null;

      decorators.tag(name, template)(tagDef);

      expect(description.name).to.eq(name);
      expect(description.view).to.eq(template);
      expect(getDescription).to.be.calledWith(tagDef);
    });

    it('should set tag description css', () => {
      const style = 'label { background-color: red; }';
      const description: any = {};
      stub(Tag, 'getDescription').returns(description);
      StoreFront.register = () => null;

      decorators.tag('', '', style)({});

      expect(description.css).to.eq(style);
    });

    it('should register resulting tag', () => {
      const name = 'some-tag';
      const tagDef = { a: 'b' };
      const internalRegister = spy();
      const register = stub(StoreFront, 'register').callsFake((cb) => cb(internalRegister));
      stub(Tag, 'getDescription').returns({});

      decorators.tag(name, '')(tagDef);

      expect(register.called).to.be.true;
      expect(internalRegister).to.be.calledWith(tagDef, name);
    });

    it('should have default view controller', () => {
      const name = 'some-tag';
      const internalRegister = spy();
      stub(StoreFront, 'register').callsFake((cb) => cb(internalRegister));
      stub(Tag, 'getDescription').returns({});

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
      const description: any = {};
      const aliasName = 'myAlias';
      const tag = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns(description);

      decorators.alias(aliasName)(tag);

      expect(getDescription).to.be.calledWith(tag);
      expect(description.alias).to.eq(aliasName);
    });
  });
});
