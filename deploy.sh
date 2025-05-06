#!/bin/bash

# Print commands and their arguments as they are executed
set -x

# Create public directory if it doesn't exist
mkdir -p public

# Copy backend files (excluding node_modules and unnecessary files)
rsync -av --progress ./backend/ ./public/backend/ \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude 'tmp' \
    --exclude '.git'

# Copy dist files if they exist
if [ -d "./dist" ]; then
    rsync -av --progress ./dist/ ./public/dist/
fi

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    git init
fi

# Configure git if not already configured
if [ -z "$(git config --get user.name)" ]; then
    git config --global user.name "soorihai2"
fi
if [ -z "$(git config --get user.email)" ]; then
    git config --global user.email "your-email@example.com"
fi

# Add the remote repository if it doesn't exist
if ! git remote | grep -q "origin"; then
    git remote add origin https://github.com/soorihai2/ssksilks.git
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "node_modules/
.env
*.log
tmp/
.DS_Store" > .gitignore
fi

# Stage all files
git add .

# Commit changes with timestamp
git commit -m "Deployment update $(date '+%Y-%m-%d %H:%M:%S')"

# Pull latest changes from remote to avoid conflicts
git pull origin main --rebase

# Push to GitHub
git push -u origin main

echo "Deployment completed successfully!" 