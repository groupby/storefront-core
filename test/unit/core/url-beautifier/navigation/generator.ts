import { UrlGenerator } from '../../../../../src/core/url-beautifier/handler';
import NavigationUrlGenerator from '../../../../../src/core/url-beautifier/navigation/generator';
import suite, { refinement } from '../../../_suite';

suite('NavigationUrlGenerator', ({ expect }) => {
  let generator: NavigationUrlGenerator;

  beforeEach(() => generator = new NavigationUrlGenerator(<any>{ config: { navigations: {} } }));

  it('should extend UrlGenerator', () => {
    expect(generator).to.be.an.instanceOf(UrlGenerator);
  });

  it('should convert a simple navigation name to a URL', () => {
    generator.config.navigations['Apples'] = {};

    expect(generator.build('Apples')).to.be.eq('/Apples');
  });

  it('should replace spaces in a navigation name with hyphen', () => {
    generator.config.navigations['red apples'] = {};

    expect(generator.build('red apples')).to.be.eq('/red-apples');
  });

  it('should encode special characters in navigation name', () => {
    generator.config.navigations['red&green apples/grapes'] = {};

    expect(generator.build('red&green apples/grapes')).to.be.eq('/red%26green-apples%2Fgrapes');
  });

  describe('error states', () => {
    it('should throw an error if the given name is not mapped', () => {
      expect(() => generator.build('Apples')).to.throw('no navigation mapping found for Apples');
    });
  });
});
