import Alias from '../../src/tag/alias';
import { expect } from '../_suite';

describe('Tag Alias', () => {

  describe('parse()', () => {
    it.only('should separate tokens', () => {
      const data = Alias.parse('my-tag:thing:other:else:what[:inner[stuff]]');

      expect(data).to.eql({
        name: 'my-tag',
        flags: ['thing', 'other', 'else', 'what'],
        child: {
          flags: ['inner'],
          child: {
            name: 'stuff',
            flags: []
          }
        }
      });
    });
  });
});
