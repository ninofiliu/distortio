/** @type {import('snowpack').SnowpackUserConfig} */
module.exports = {
  mount: {
    public: {
      url: '/',
      static: true,
    },
    src: {
      url: '/dist',
    },
  },
  plugins: [
    '@snowpack/plugin-typescript',
    './plaintext-plugin.js',
  ],
};
