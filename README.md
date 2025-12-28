# Word Count Gold Edition

[![Run Extension Tests](https://github.com/alessandrocuzzocrea/word-count-gold-edition/actions/workflows/test.yml/badge.svg)](https://github.com/alessandrocuzzocrea/word-count-gold-edition/actions/workflows/test.yml)

This extension provides a word count for each section in a Markdown file, displayed via CodeLens above headers.

## Features

- **Section-based counting**: Counts words between headers.
- **Hugo Friendly**: Ignores YAML Frontmatter when calculating the first section.
- **CodeLens UI**: Displays counts unobtrusively above headers.

## How to Run

1. Open this folder in VS Code.
2. Run `npm install` to install dependencies.
3. Press `F5` to open a new window with the extension loaded.
4. Open a Markdown file to see the word counts.

## Requirements

- VS Code 1.75.0 or higher
- Node.js installed
