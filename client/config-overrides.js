const path = require('path');

module.exports = function override(config, env) {
  // Find the oneOf array in the module rules
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);

  if (oneOfRule && oneOfRule.oneOf) {
    // Add our babel-loader rule for MUI at the beginning of oneOf array
    oneOfRule.oneOf.unshift({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: /node_modules[\\/]@mui/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: [
          [
            require.resolve('@babel/preset-env'),
            {
              targets: {
                browsers: ['last 2 versions', 'ie >= 11'],
              },
            },
          ],
          [
            require.resolve('@babel/preset-react'),
            {
              runtime: 'automatic',
            },
          ],
        ],
        plugins: [
          require.resolve('@babel/plugin-transform-class-properties'),
          require.resolve('@babel/plugin-proposal-optional-chaining'),
          require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
        ],
        cacheDirectory: true,
        cacheCompression: false,
      },
    });
  }

  // Add webpack aliases
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
    '@/apiConfig': path.resolve(__dirname, 'src/services/apiConfig'),
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/shared': path.resolve(__dirname, 'src/components/shared'),
    '@/hooks': path.resolve(__dirname, 'src/hooks'),
    '@/utils': path.resolve(__dirname, 'src/utils'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/features': path.resolve(__dirname, 'src/features'),
    '@/assets': path.resolve(__dirname, 'src/assets'),
    '@/styles': path.resolve(__dirname, 'src/styles'),
    '@/features': path.resolve(__dirname, 'src/features'),
  };

  return config;
};
