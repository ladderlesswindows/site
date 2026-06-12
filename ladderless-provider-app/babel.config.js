module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // 'expo-router/babel' has been removed (deprecated since SDK 50+)
  };
};
