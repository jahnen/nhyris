# Copyright (c) 2025 Jinhwan Kim
#!/bin/bash

# get project name as argument
PROJECT_NAME=$1

# check if project name is provided
if [ -z "$PROJECT_NAME" ]; then
    echo "❌ enter project name: make-project.sh <project-name>"    
    exit 1
fi

cd "$PROJECT_NAME"

electron-forge make

# back to parent directory
cd ..

echo "✅ project: '$PROJECT_NAME' created successfully"
echo "📦 check 'out' directory for the installer"