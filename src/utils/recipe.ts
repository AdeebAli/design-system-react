import type { StyleRule } from '@vanilla-extract/css';
import { componentsLayer } from '../styles/layers.css';

/**
 * Wraps a style in the ds.components layer. recipe() has no layer option, so
 * every component style goes through this (Spec 05).
 */
export function layered(rule: StyleRule): StyleRule {
  return { '@layer': { [componentsLayer]: rule } };
}
