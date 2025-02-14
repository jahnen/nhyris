# Copyright (c) 2025 Jinhwan Kim
#!/bin/bash

# get project name as argument
PROJECT_NAME=$1

# check if project name is provided
if [ -z "$PROJECT_NAME" ]; then
    echo "❌ enter project name: project.sh <project-name>"    
    exit 1
fi

# make project directory
if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️ '$PROJECT_NAME' directory exists. try to delete it."
else
    echo "📁 make '$PROJECT_NAME' directory"
    mkdir "$PROJECT_NAME"
fi

# add project directory to .gitignore
echo "\n$PROJECT_NAME/\n" >> .gitignore

# copy files to project directory
echo "📂 copying template files into '$PROJECT_NAME' "

# R files
cp "r.sh" "$PROJECT_NAME"
cp "add-cran-binary-pkgs.R" "$PROJECT_NAME" 

# electron files
cp "package.json" "$PROJECT_NAME"
cp "forge.config.js" "$PROJECT_NAME"
cp "start-shiny.r" "$PROJECT_NAME"

# directory
cp -r src "$PROJECT_NAME"
cp -r shiny "$PROJECT_NAME"

echo "✅ project: '$PROJECT_NAME' created successfully"

# change directory
cd "$PROJECT_NAME"

# install local R
echo "📦 installing standalone R"
sh ./r.sh

# install R packages
echo "📦 installing R packages"
Rscript ./add-cran-binary-pkgs.R

# install node packages
echo "📦 installing node packages"
npm install 

# start electron
echo "🚀 starting electron"
electron-forge start 

# back to parent directory
cd ..