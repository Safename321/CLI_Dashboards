// Single source of truth for the app version (§4.9).
// `buildLetter` in package.json advances one alphabet step (a, b, c, …) per
// deployed update, so the shown version reads e.g. v2.0.0a, v2.0.0b, …
// This drives EVERY in-app version display (login footer, sidebar, and the
// REPORT_VERSION used across all generated report footers).
import pkg from '../../package.json';

export const APP_VERSION = `${pkg.version}${pkg.buildLetter || ''}`;
export const APP_VERSION_LABEL = `v${APP_VERSION}`;
