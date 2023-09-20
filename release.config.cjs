const yaml = require('js-yaml');
const Handlebars = require('handlebars')

Handlebars.registerHelper("yamlString", function (options) {
  const input = options.fn(this).trim()
  return yaml.dump(input.replace(/^\s*\*\s*/g, '').trim(), {lineWith: 999, forceQuotes: true, quotingType: '"'});
});

/*
const chartPath = process.env.CHART_PATH;
if (!chartPath) {
  throw new Error('No chart path defined')
}
*/

module.exports = {
  "branches": [
    "main",
  ],
  "tagFormat": process.env.CHART_NAME + "-v${version}",
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {}
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "writerOpts": {
          "mainTemplate": "{{#each commitGroups}}{{#each commits}} - {{#yamlString}}{{> commit root=@root}}{{/yamlString}}{{/each}}{{/each}}",
        }
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md"
      }
    ],
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "helm-docs",
        "publishCmd": "cr package . && cr upload -o halkeye -r helm-charts -c $(git rev-parse HEAD) --release-notes-file CHANGELOG.md --push --packages-with-index --skip-existing"
      }
    ],
    [
      "semantic-release-helm3",
      {
        "chartPath": ".",
        "populateChangelog": "true",
        "onlyUpdateVersion": "true"
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": [
          "Chart.yaml"
        ],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}

