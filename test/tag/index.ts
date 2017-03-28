import Tag from '../../src/tag';
import { expect, sinon } from '../_suite';

describe('Tag', () => {
  afterEach(() => sinon.restore());

  describe('mixin()', () => {
    it('should add properties from app', () => {
      const services = { a: 'b' };
      const config = { c: 'd' };

      const mixin = Tag.mixin(<any>{ services, config });

      expect(mixin.services).to.eq(services);
      expect(mixin.config).to.eq(config);
    });

    it('should have methods', () => {
      const mixin = Tag.mixin(<any>{});

      expect(mixin.init).to.be.a('function');
    });

    describe('init()', () => {
      it('should wrap the underlying tag', () => {
        const tag = {};
        const mixin = Tag.mixin(<any>{});
        const wrap = sinon.stub(Tag, 'wrap');

        mixin.init.bind(tag)();

        expect(wrap.calledWith(tag)).to.be.true;
      });
    });
  });

  // describe('wrap()', () => {
  //   it('should replace update method', () => {
  //     const tag: any = {};
  //
  //     Tag.wrap(tag);
  //
  //     expect(tag.state).to.eql({});
  //   });
  // 
  //   it('should replace update method', () => {
  //     const data = { a: 'b' };
  //     const update = sinon.spy();
  //     const tag: any = { update };
  //
  //     Tag.wrap(tag);
  //
  //     expect(tag.update).to.not.eq(update);
  //
  //     tag.update(data);
  //
  //     expect(update.calledWith({ state: data })).to.be.true;
  //   });
  //
  //   describe('update()', () => {
  //     let update: sinon.SinonSpy;
  //     let tag: Tag.Instance;
  //     beforeEach(() => {
  //       update = sinon.spy();
  //       tag = <any>{ update };
  //       Tag.wrap(tag);
  //     });
  //
  //     it('should call the original update()', () => {
  //       const data = { a: 'b' };
  //
  //       tag.update(data);
  //
  //       expect(update.calledWith({ state: data })).to.be.true;
  //     });
  //
  //     it('should mixin with existing state', () => {
  //       const data = { a: 'b1' };
  //
  //       tag.state = { a: 'b', c: 'd' };
  //       tag.update(data);
  //
  //       expect(update.calledWith({ state: { a: 'b1', c: 'd' } })).to.be.true;
  //     });
  //   });
  // });
});
