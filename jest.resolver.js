module.exports = (path, options) => {
  // Call the default resolver
  return options.defaultResolver(path, {
    ...options,
    packageFilter: pkg => {
      // This is a workaround for packages that use module/jsnext:main/exports
      // https://github.com/facebook/jest/issues/9771
      if (pkg.module || pkg['jsnext:main']) {
        delete pkg.main;
      }
      return pkg;
    },
  });
};
