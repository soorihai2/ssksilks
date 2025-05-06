#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="sathyabhama_silks_backup_${TIMESTAMP}"
PROJECT_ROOT="."
VERSION_FILE="version.txt"
PM2_CONFIG="ecosystem.config.js"

# Get current version or create if not exists
if [ -f "$VERSION_FILE" ]; then
    CURRENT_VERSION=$(cat "$VERSION_FILE")
    NEW_VERSION=$((CURRENT_VERSION + 1))
else
    NEW_VERSION=1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create the backup using tar
# Excluding:
# - node_modules
# - dist directory
# - .git directory
# - development files
# - environment files except example
# - OS specific files
# - logs directory
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='.env.production' \
    --exclude='.env.preview' \
    --exclude='*.tsbuildinfo' \
    --exclude='.cursor' \
    --exclude='backups' \
    --exclude='logs' \
    --exclude='backup.sh' \
    -C "$PROJECT_ROOT" .

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    # Update version file
    echo "$NEW_VERSION" > "$VERSION_FILE"
    echo "📝 Updated version to: $NEW_VERSION"
    
    # Display backup size
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)
    echo "📦 Backup size: ${BACKUP_SIZE}"
    
    # List contents of backup directory
    echo "📂 Available backups:"
    ls -lh "${BACKUP_DIR}"
    
    # Store current directory
    CURRENT_DIR=$(pwd)
    
    # Clean up old backups (keep last 5)
    cd "${BACKUP_DIR}"
    ls -t | tail -n +6 | xargs -I {} rm -- {} 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "🧹 Cleaned up old backups (keeping last 5)"
    fi
    
    # Create a log entry with version
    echo "[${TIMESTAMP}] Backup created: ${BACKUP_NAME}.tar.gz (${BACKUP_SIZE}) Version: ${NEW_VERSION}" >> backup.log
    
    # Return to original directory
    cd "$CURRENT_DIR"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "✨ Backup process completed!" 