import {
  getColorModeScript,
  type ColorModeScriptOptions,
} from './getColorModeScript';

export interface ColorModeScriptProps extends ColorModeScriptOptions {
  /** For strict Content Security Policies. */
  nonce?: string;
}

/**
 * Applies a stored choice or lock before first paint. Server rendering only:
 * place it at the start of `body`, or in `head`. Client-rendered apps use
 * `getColorModeScript`.
 */
export function ColorModeScript({ nonce, ...options }: ColorModeScriptProps) {
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: getColorModeScript(options) }}
    />
  );
}
