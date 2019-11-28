module.exports = {
  presets: [
    [
      "@babel/env",
      {
        modules: "commonjs"
      }
    ]
  ],
  plugins: ["@babel/plugin-transform-runtime", "add-module-exports"]
};
