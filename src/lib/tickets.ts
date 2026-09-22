/**
 * Entry identity.
 *
 * Every entry in a pool stands for one stub, and a stub answers to its own identity rather than to
 * the row it arrived in. Rows reach the app from the bundled roster, from ids minted for hand-typed
 * entries and from ids carried over by a spreadsheet import, so the identity is read off the entry
 * id itself: an id keeps its identity when it is retyped in another case or joined up with another
 * separator, which is what keeps a list that is pasted in twice from adding stubs to a pool.
 */

/** Characters that only hold the parts of an id apart and say nothing about the entry itself. */
const JOINERS = new Set([0x20, 0x2d, 0x5f]);

/** Upper and lower case spell the same part of an id, so a character is read in one case. */
const foldCase = (code: number): number => (code >= 0x41 && code <= 0x5a ? code + 0x20 : code);

export const stubIdentity = (id: string): number => {
  let identity = 0x811c9dc5;

  for (let index = 0; index < id.length; index += 1) {
    const code = id.charCodeAt(index);
    if (JOINERS.has(code)) continue;
    identity = Math.imul(identity ^ foldCase(code), 0x01000193);
  }

  return identity >>> 0;
};

/** True when two rows carry the same stub, identity for identity. */
export const isSameTicket = (leftId: string, rightId: string): boolean =>
  stubIdentity(leftId) === stubIdentity(rightId);
