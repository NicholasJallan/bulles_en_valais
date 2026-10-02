// svgo (npx svgo <file>): keep the ids, groups and separate paths the animations rely on
// (#mark, #bubbles with one path per bubble, #wordmark).
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: { overrides: { cleanupIds: false, collapseGroups: false, mergePaths: false } },
    },
  ],
};
