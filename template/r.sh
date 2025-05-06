# Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn
# Copyright (c) 2023 Jinhwan Kim

#!/usr/bin/env bash
set -e

# Define the R version explicitly
# Chosen for compatibility with specific dependencies
R_VERSION="4.5.0"
R_URL="https://cloud.r-project.org/bin/macosx/big-sur-arm64/base/R-${R_VERSION}-arm64.pkg"

# Print the R version being installed
echo "Installing R version: $R_VERSION"

# Download and extract the main Mac Resources directory
# Updated as Sonoma / m1
mkdir -p r-mac
curl -o r-mac/latest_r.pkg "$R_URL"

cd r-mac
xar -xf latest_r.pkg
rm -r Resources tcltk.pkg texinfo.pkg Distribution latest_r.pkg
# cat R-app.pkg/Payload | gunzip -dc | cpio -i
cat R-fw.pkg/Payload | gunzip -dc | cpio -i
mv R.framework/Versions/Current/Resources/* .
rm -r R-fw.pkg R.framework

# Patch the main R script
sed -i.bak '/^R_HOME_DIR=/d' bin/R
sed -i.bak 's;/Library/Frameworks/R.framework/Resources;${R_HOME};g' \
    bin/R
chmod +x bin/R
rm -f bin/R.bak

# Remove unnecessary files
rm -r doc tests
rm -r lib/*.dSYM
