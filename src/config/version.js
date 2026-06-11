// Single source of truth for the app version (§4.9).
// Vite injects package.json version at build time via define; fall back for tests.
import pkg from '../../package.json';

export const APP_VERSION = pkg.version;
export const APP_VERSION_LABEL = `v${pkg.version}`;
