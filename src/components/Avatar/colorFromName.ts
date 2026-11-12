/** One of `Avatar`'s six color pairs. */
export type AvatarColorIndex = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Picks a color pair from the name with an FNV-1a hash, so the same name gets
 * the same color on the server, the client, and every page. Changing the hash
 * recolors every avatar, so a test pins it.
 */
export function avatarColorIndex(name: string): AvatarColorIndex {
  let hash = 0x811c9dc5;
  for (let index = 0; index < name.length; index++) {
    hash ^= name.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (((hash >>> 0) % 6) + 1) as AvatarColorIndex;
}
