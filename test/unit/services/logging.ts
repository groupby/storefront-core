import { Events } from '@storefront/flux-capacitor';
import Tag from '../../../src/core/tag';
import { log } from '../../../src/core/utils';
import Service from '../../../src/services/logging';
import { TRACKER_EVENT } from '../../../src/services/tracker';
import suite from './_suite';

suite('Logging Service', ({ expect, spy, stub, itShouldBeCore, itShouldExtendBaseService }) => {

  itShouldBeCore(Service);

  describe('constructor()', () => {
    itShouldExtendBaseService(() => new Service(<any>{}, { level: 'info' }));

    it('should set log level', () => {
      const setLevel = stub(log, 'setLevel');

      new Service(<any>{}, { level: 'warn' }); // tslint:disable-line:no-unused-new

      expect(setLevel).to.be.calledWith('warn');
    });
  });

  describe('init()', () => {
    it('should set log', () => {
      const app: any = { flux: { on: () => null } };

      new Service(app, { level: 'debug' }).init();

      expect(app.log).to.eq(log);
    });

    it('should listen for OBSERVER_NODE_CHANGED', () => {
      const on = spy();
      const app: any = { flux: { on } };
      const service = new Service(app, { level: 'debug', debug: { observer: true } });

      service.init();

      expect(on).to.be.calledOnce
        .and.calledWithExactly(Events.OBSERVER_NODE_CHANGED, service.logObserverNodeChange);
    });

    it('should listen for TAG_LIFECYCLE', () => {
      const on = spy();
      const app: any = { flux: { on } };
      const service = new Service(app, { level: 'debug', debug: { lifecycle: true } });

      service.init();

      expect(on).to.be.calledOnce
        .and.calledWithExactly(Events.TAG_LIFECYCLE, service.logTagLifecycle);
    });

    it('should listen for TAG_ALIASING', () => {
      const on = spy();
      const app: any = { flux: { on } };
      const service = new Service(app, { level: 'debug', debug: { aliasing: true } });

      service.init();

      expect(on).to.be.calledOnce
        .and.calledWithExactly(Events.TAG_ALIASING, service.logAliasing);
    });

    it('should listen for TRACKER_EVENT', () => {
      const on = spy();
      const app: any = { flux: { on } };
      const service = new Service(app, { level: 'debug', debug: { tracker: true } });

      service.init();

      expect(on).to.be.calledOnce
        .and.calledWithExactly(TRACKER_EVENT, service.logTrackerEvent);
    });

    it('should listen for all events', () => {
      const on = spy();
      const app: any = { flux: { on } };
      const service = new Service(app, { level: 'debug', debug: true });

      service.init();

      expect(on).to.have.callCount(4)
        .and.calledWith(Events.OBSERVER_NODE_CHANGED)
        .and.calledWith(Events.TAG_LIFECYCLE)
        .and.calledWith(Events.TAG_ALIASING)
        .and.calledWith(TRACKER_EVENT);
    });
  });

  describe('logObserverNodeChange()', () => {
    it('should create log entry for a change in an observer node', () => {
      const debug = spy();
      const app: any = { log: { debug } };
      const path = 'app.state.model';
      const event = 'props_update';
      const value = { a: 'b' };
      const service = new Service(app, { level: 'debug' });

      service.logObserverNodeChange({ path, event, value });

      expect(debug).to.be.calledWithExactly(
        `[event]: %c${event} %c${path}`,
        'color: darkgreen; font-weight: bold',
        'color: darkgreen',
        value
      );
    });
  });

  describe('logTagLifecycle()', () => {
    it('should create log entry for a change in an observer node', () => {
      const debug = spy();
      const app: any = { log: { debug } };
      const phase = 'updated';
      const name = 'myTag';
      const tag: any = { a: 'b' };
      const service = new Service(app, { level: 'debug' });
      const getMeta = stub(Tag, 'getMeta').returns({ name });

      service.logTagLifecycle({ phase, tag });

      expect(debug).to.be.calledWithExactly(
        `%c${phase}%c - %c${name}`,
        'color: #42b121; font-weight: bold',
        '',
        'color: black; font-weight: bold; text-decoration: underline',
        tag
      );
      expect(getMeta).to.be.calledWithExactly(tag);
    });

    it('should default to empty name', () => {
      const debug = spy();
      const app: any = { log: { debug } };
      const phase = 'updated';
      const service = new Service(app, { level: 'debug' });
      stub(Tag, 'getMeta').returns({});

      service.logTagLifecycle({ phase, tag: <any>{} });

      expect(debug).to.be.calledWith(`%c${phase}%c - %c`);
    });
  });

  describe('logTrackerEvent()', () => {
    it('should create log entry for a change in an observer node', () => {
      const debug = spy();
      const app: any = { log: { debug } };
      const type = 'props_update';
      const event = { a: 'b' };
      const service = new Service(app, { level: 'debug' });

      service.logTrackerEvent({ type, event });

      expect(debug).to.be.calledWithExactly(
        `[tracker]: %c${type}`,
        'color: #75babe; font-weight: bold',
        event
      );
    });
  });

  describe('logAliasing()', () => {
    it('should create log entry for a change in an observer node', () => {
      const debug = spy();
      const app: any = { log: { debug } };
      const action = 'added';
      const name = 'myTag';
      const type = 'props_update';
      const aliases = { a: 'b' };
      const service = new Service(app, { level: 'debug' });

      service.logAliasing({ action, name, type, aliases });

      expect(debug).to.be.calledWithExactly(
        `%c${action} ${type ? `'${type}' ` : ''}alias`,
        'color: #306895; font-weight: bold',
        name,
        aliases
      );
    });
  });
});
