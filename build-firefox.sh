#!/bin/sh

# Shell script to build Firefox version of this plugin

# Replace firefox folder
rm -r Firefox/*
cp Chrome/* Firefox

# Change chrome calls to firefox (Do several times because Mac uses BSD Sed)
sed -i 's/chrome\./browser\./' Firefox/*.js

# Change sync calls to local
sed -i 's/storage\.sync/storage\.local/' Firefox/*.js
