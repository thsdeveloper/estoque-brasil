import baseConfig from "@estoque-brasil/eslint-config/next";

const config = [
  ...baseConfig,
  {
    rules: {
      // Enforce feature boundaries - prevent deep imports into features
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/components/*"],
              message:
                "Import from the feature's public API: @/features/<feature-name>",
            },
            {
              group: ["@/features/*/api/*"],
              message:
                "Import from the feature's public API: @/features/<feature-name>",
            },
            {
              group: ["@/features/*/hooks/*"],
              message:
                "Import from the feature's public API: @/features/<feature-name>",
            },
            {
              group: ["@/features/*/types/*"],
              message:
                "Import from the feature's public API: @/features/<feature-name>",
            },
            {
              group: ["@/features/*/data/*"],
              message:
                "Import from the feature's public API: @/features/<feature-name>",
            },
          ],
        },
      ],
    },
  },
];

export default config;
