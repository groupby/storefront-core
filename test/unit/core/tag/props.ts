import { StoreSections } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import Tag, { TAG_DESC } from '../../../../src/core/tag';
import Phase from '../../../../src/core/tag/phase';
import Props from '../../../../src/core/tag/props';
import suite from '../../_suite';

suite('Tag Props', ({ expect, spy, stub }) => {
  describe('globalConfiguration()', () => {
    it('should extract configuration for tag if configurable', () => {
      const config = { a: 'b' };
      const tag: any = { config: { tags: { myTag: config } } };
      const getMeta = stub(Tag, 'getMeta').returns({ configurable: true, name: 'gb-my-tag' });

      const globalConfig = Props.globalConfiguration(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(globalConfig).to.eq(config);
    });

    it('should not extract configuration for tag if not configurable', () => {
      const tag: any = {};
      stub(Tag, 'getMeta').returns({ configurable: false, name: 'gb-my-tag' });

      expect(Props.globalConfiguration(tag)).to.eql({});
    });
  });

  describe('buildProps()', () => {
    it('should disable stylish if disabling all style', () => {
      const ui = false;
      const tag: any = {
        opts: {},
        props: {},
        config: { options: {} },
        parent: { props: { ui, stylish: true } },
      };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(Props, 'globalConfiguration');

      const props = Props.buildProps(tag, tag.opts);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish: false, storeSection: StoreSections.DEFAULT });
    });

    it('should inherit from parent tag', () => {
      const ui = true;
      const stylish = false;
      const storeSection = 'tessttest';
      const tag: any = {
        opts: {},
        props: {},
        config: { options: {} },
        parent: { props: { ui, stylish, storeSection } },
      };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(Props, 'globalConfiguration');

      const props = Props.buildProps(tag, tag.opts);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish, storeSection });
    });

    it('should overwrite inherited storeSection with own storeSection', () => {
      const ui = true;
      const stylish = false;
      const storeSection = 'tessttest';
      const tag: any = {
        opts: { storeSection },
        props: {},
        config: { options: {} },
        parent: { props: { ui, stylish, storeSection: 'teeeeest' } },
      };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(Props, 'globalConfiguration');

      const props = Props.buildProps(tag, tag.opts);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish, storeSection });
    });

    it('should stack configuration', () => {
      const ui = true;
      const stylish = false;
      const defaults = { a: 'b', c: 'd', e: 'f', g: 'h' };
      const globals = { c: 'd1', e: 'f1', g: 'h1' };
      const opts = { g: 'h3', __proto__: { e: 'f2', g: 'h2' } };
      const tag: any = { opts, props: {}, config: { options: { ui, stylish } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults });
      const globalConfiguration = stub(Props, 'globalConfiguration').returns(globals);

      const props = Props.buildProps(tag, opts);

      expect(getMeta).to.be.calledWith(tag);
      expect(globalConfiguration).to.be.calledWith(tag);
      expect(props).to.eql({
        ui,
        stylish,
        storeSection: StoreSections.DEFAULT,
        a: 'b',
        c: 'd1',
        e: 'f2',
        g: 'h3',
      });
    });
  });
});
