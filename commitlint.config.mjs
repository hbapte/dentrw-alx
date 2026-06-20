/* eslint-disable import/no-anonymous-default-export */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "ci",
        "build",
        "revert",
        "wip",
        "lint",
      ],
    ],
    "header-max-length": [2, "always", 2000],
    "body-max-line-length": [0, "always", Infinity],
  },
}
