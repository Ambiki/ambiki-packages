import { expect } from '@open-wc/testing';
import { brandedId } from '../src/random-id';

describe('brandedId', () => {
  it('returns a random string', () => {
    const id1 = brandedId();
    const id2 = brandedId();

    expect(id1).not.to.equal(id2);
    expect(typeof id1).to.equal('string');
  });
});
