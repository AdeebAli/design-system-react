/** A file `FileUpload` didn't add, and why. */
export interface FileRejection {
  file: File;
  /** `type`: not in `accept`. `size`: over `maxSize`. `count`: over `maxFiles`, or more than one without `multiple`. */
  reason: 'type' | 'size' | 'count';
}

export interface MergeRules {
  multiple: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
}

const same = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/** Whether a file matches the native `accept` syntax: extensions, MIME types, and `type/*`. */
function accepts(file: File, accept: string | undefined): boolean {
  const tokens = (accept ?? '')
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  // File.type is already lowercase (File API).
  const type = file.type;
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

/**
 * Merges picked or dropped files into the current list. Each incoming file is
 * checked in order, by type, then size, then count; duplicates (same name,
 * size, and last-modified time) are skipped without a rejection. With
 * `multiple`, files are added; without it, the first accepted file replaces
 * the list.
 */
export function mergeFiles(
  current: readonly File[],
  incoming: readonly File[],
  rules: MergeRules,
): { files: File[]; rejections: FileRejection[] } {
  const limit = rules.multiple ? rules.maxFiles : 1;
  const files = rules.multiple ? [...current] : [];
  const kept = rules.multiple ? files : [...current];
  const rejections: FileRejection[] = [];
  let added = 0;

  for (const file of incoming) {
    if (kept.some((f) => same(f, file)) || files.some((f) => same(f, file))) {
      continue;
    }
    if (!accepts(file, rules.accept)) {
      rejections.push({ file, reason: 'type' });
    } else if (rules.maxSize != null && file.size > rules.maxSize) {
      rejections.push({ file, reason: 'size' });
    } else if (
      limit != null &&
      (rules.multiple ? files.length : added) >= limit
    ) {
      rejections.push({ file, reason: 'count' });
    } else {
      files.push(file);
      added++;
    }
  }

  // Without `multiple`, a drop with nothing accepted keeps the current file.
  return {
    files: rules.multiple || added > 0 ? files : [...current],
    rejections,
  };
}
