import { expect } from '@open-wc/testing';
import randomId from '../src/random-id';

describe('randomId', () => {
  it('returns a random string', () => {
    const id1 = randomId();
    const id2 = randomId();

    expect(id1).not.to.equal(id2);
    expect(typeof id1).to.equal('string');
  });
});
