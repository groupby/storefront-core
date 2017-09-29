import { Events, Selectors } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import * as UrlBeautifier from '../../../src/core/url-beautifier';
import * as utils from '../../../src/core/utils';
import Service from '../../../src/services/redirect';
import suite from './_suite';

suite('URL Service', ({ expect, spy, stub, itShouldBeCore, itShouldExtendBaseService }) => {
  let service: Service;

  beforeEach(() => service = new Service(<any>{}, <any>{}));

  itShouldBeCore(Service);

  describe('constructor()', () => {
    itShouldExtendBaseService(() => service);
  });

  describe('init()', () => {
    it('should listen for redirect event', () => {
      const on = spy();
      service['app'] = <any>{ flux: { on } };

      service.init();

      expect(on).to.be.calledWithExactly(Events.REDIRECT, service.redirect);
    });
  });

  describe('redirect()', () => {
    it('should call location.assign() with url', () => {
      const url = 'www.example.com';
      const assign = spy();
      stub(utils, 'WINDOW').returns({ location: { assign } });

      service.redirect(url);

      expect(assign).to.be.calledWithExactly(url);
    });
  });
});
