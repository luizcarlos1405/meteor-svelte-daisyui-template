const { defineConfig } = require('@meteorjs/rspack');
const sveltePreprocess = require('svelte-preprocess');

// svelte-loader greps the `--config` file for `conditionNames` on first load, but Meteor passes its
// own wrapper config (node_modules/@meteorjs/rspack), so the check always misfires. The real client
// config below does include 'svelte'; preload the loader with that one false-positive warning muted.
{
  const warn = console.warn;
  console.warn = (...args) => {
    if (!String(args[0]).includes('"resolve.conditionNames"')) warn(...args);
  };
  try {
    require('svelte-loader');
  } finally {
    console.warn = warn;
  }
}

/**
 * Rspack configuration for Meteor projects.
 *
 * Provides typed flags on the `Meteor` object, such as:
 * - `Meteor.isClient` / `Meteor.isServer`
 * - `Meteor.isDevelopment` / `Meteor.isProduction`
 * - …and other flags available
 *
 * Use these flags to adjust your build settings based on environment.
 */
module.exports = defineConfig((Meteor) => {
  return {
    // Force TypeScript parsing for plain .ts/.svelte.ts files
    // (Meteor.isTypescriptEnabled detection isn't picking up the typescript pkg here).
    ...Meteor.extendSwcConfig({
      jsc: { parser: { syntax: 'typescript' } },
    }),
    ...(Meteor.isClient && {
      resolve: {
        extensions: ['.mjs', '.js', '.ts', '.svelte', '.json'],
        mainFields: ['svelte', 'browser', 'module', 'main'],
        conditionNames: ['svelte', 'browser', 'import', 'module', 'default'],
      },
      module: {
        rules: [
          {
            // Allow extensionless imports inside ESM packages (e.g. lucide-svelte)
            test: /\.m?js$/i,
            resolve: { fullySpecified: false },
          },
          {
            test: /\.svelte$/,
            use: [
              {
                loader: 'svelte-loader',
                options: {
                  compilerOptions: { dev: !Meteor.isProduction },
                  emitCss: Meteor.isProduction,
                  hotReload: !Meteor.isProduction,
                  preprocess: sveltePreprocess({
                    sourceMap: !Meteor.isProduction,
                    postcss: true,
                    typescript: {
                      typesCheck: false, // typecheck via `npm run typecheck` (svelte-check), not on every build
                    },
                  }),
                },
              },
            ],
          },
          {
            test: /\.css$/i,
            use: [{ loader: 'postcss-loader' }],
            type: 'css/auto',
          },
        ],
      },
    }),
  };
});
