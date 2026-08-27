# @autono/open-pdf

## 0.1.1

### Patch Changes

- [#13](https://github.com/autonoco/open-pdf/pull/13) [`b76ef8e`](https://github.com/autonoco/open-pdf/commit/b76ef8e5bf3b7677abaa569dbebe4278665cf4b1) Thanks [@bobakemamian](https://github.com/bobakemamian)! - Fix `open-pdf build`: the render worker now ships as ESM and bundles docs, so static builds render. Unknown doc ids show an error instead of rendering forever.

- [#13](https://github.com/autonoco/open-pdf/pull/13) [`6ede8f8`](https://github.com/autonoco/open-pdf/commit/6ede8f8cb6b17b65d27e0df19a332d1e0d941d5e) Thanks [@bobakemamian](https://github.com/bobakemamian)! - Inject inspector loc tags during static worker builds so inspect mode works in built previews.
