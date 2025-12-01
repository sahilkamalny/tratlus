#!/usr/bin/env bash
set -e

branch_name=current-local-version

# Initialize and setup
git init
git branch -m $branch_name

git fetch origin
git checkout origin/dev -- .gitignore

# Commit current state
git add .
git commit -m "Current local version"

# Switch to dev and merge changes
git checkout -b dev origin/dev
git checkout $branch_name -- .
git branch -D $branch_name
git checkout -b $branch_name
