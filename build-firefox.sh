#!/bin/sh

# Shell script to build Firefox version of this plugin

# Replace firefox folder
rm -rf Firefox
mkdir Firefox
cp Chrome/* Firefox

# Change chrome calls to firefox (Do several times because Mac uses BSD Sed)
sed -i '' -E 's/chrome\./browser\./' Firefox/background.js
sed -i '' -E 's/chrome\./browser\./' Firefox/content.js
sed -i '' -E 's/chrome\./browser\./' Firefox/popup.js

# Change sync calls to local
sed -i '' -E 's/storage\.sync/storage\.local/' Firefox/background.js
sed -i '' -E 's/storage\.sync/storage\.local/' Firefox/content.js
sed -i '' -E 's/storage\.sync/storage\.local/' Firefox/popup.js