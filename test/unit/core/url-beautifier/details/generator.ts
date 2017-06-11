import DetailsUrlGenerator from '../../../../../src/core/url-beautifier/details/generator';
import { UrlGenerator } from '../../../../../src/core/url-beautifier/handler';
import suite, { refinement } from '../../../_suite';

suite('DetailsUrlGenerator', ({ expect }) => {
  let generator: DetailsUrlGenerator;

  beforeEach(() => generator = new DetailsUrlGenerator(<any>{ config: { refinementMapping: [] } }));

  it('should extend UrlGenerator', () => {
    expect(generator).to.be.an.instanceOf(UrlGenerator);
  });

  it('should convert a simple detail to a URL', () => {
    expect(generator.build({
      title: 'red and delicious apples',
      id: '1923',
      refinements: []
    }))
      .to.eq('/red-and-delicious-apples/1923');
  });

  it('should encode special characters + in detail', () => {
    expect(generator.build({
      title: 'red+and+delicious+apples',
      id: '1923',
      refinements: []
    }))
      .to.eq('/red%2Band%2Bdelicious%2Bapples/1923');
  });

  it('should encode special characters / in detail', () => {
    expect(generator.build({
      title: 'red/and/delicious/apples',
      id: '1923',
      refinements: []
    }))
      .to.eq('/red%2Fand%2Fdelicious%2Fapples/1923');
  });

  it('should convert a detail with refinements to a URL without reference keys', () => {
    generator.config.useReferenceKeys = false;
    const url = generator.build({
      title: 'satin shiny party dress',
      id: '293014',
      refinements: [refinement('colour', 'red')]
    });

    expect(url).to.eq('/satin-shiny-party-dress/red/colour/293014');
  });

  it('should convert detail with refinements to a URL and encode special characters without reference keys', () => {
    generator.config.useReferenceKeys = false;
    const url = generator.build({
      title: 'satin shiny party dress',
      id: '293014',
      refinements: [refinement('colour', 'red+green/blue')]
    });

    expect(url).to.eq('/satin-shiny-party-dress/red%2Bgreen%2Fblue/colour/293014');
  });

  it('should convert a detail with a single refinement to a URL with a reference key', () => {
    generator.config.useReferenceKeys = true;
    generator.config.refinementMapping = [{ c: 'colour' }];
    const url = generator.build({
      title: 'dress',
      id: '293014',
      refinements: [refinement('colour', 'red')]
    });

    expect(url).to.eq('/dress/red/c/293014');
  });

  it('should convert a detail with multiple refinements to a URL with reference keys', () => {
    generator.config.useReferenceKeys = true;
    generator.config.refinementMapping = [{ c: 'colour' }, { b: 'brand' }];
    const url = generator.build({
      title: 'dress',
      id: '293014',
      refinements: [refinement('colour', 'red'), refinement('brand', 'h&m')]
    });

    expect(url).to.eq('/dress/h%26m/red/bc/293014');
  });

  describe('error states', () => {
    it('should throw an error if no reference key found for refinement navigation name', () => {
      generator.config.useReferenceKeys = true;
      const build = () => generator.build({
        title: 'dress',
        id: '293014',
        refinements: [refinement('colour', 'red')]
      });

      expect(build).to.throw("no mapping found for navigation 'colour'");
    });
  });
});
