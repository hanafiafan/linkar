import('./node_modules/astro/dist/cli/index.js').then(({ cli }) => {
  process.argv = [process.argv[0], 'mydev.js', 'dev'];
  cli(process.argv);
});
