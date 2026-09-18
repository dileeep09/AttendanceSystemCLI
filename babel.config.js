module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.ts', '.android.ts', '.ts', '.tsx', '.ios.tsx', '.android.tsx', '.js'],
          alias: {
            '@assets': './src/assets',
            '@globalComponents': './src/components/global',
            '@components': './src/components',
            '@contexts': './src/contexts',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@screens': './src/screens',
            '@services': './src/services',
            '@storage': './src/storage',
            '@theme': './src/theme',
            '@types': './src/types',
            '@utils': './src/utils'
          }
        }
      ]
    ]
  };
};
