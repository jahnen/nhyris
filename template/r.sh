# Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn
# Copyright (c) 2023 Jinhwan Kim

#!/usr/bin/env bash
set -e

# Detect operating system
OS_TYPE="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win"* ]]; then
    OS_TYPE="windows"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
fi

echo "Detected OS: $OS_TYPE"

# Define the R version explicitly
# Chosen for compatibility with specific dependencies
R_VERSION="4.5.0"

if [ "$OS_TYPE" == "macos" ]; then
    # macOS installation
    R_URL="https://cloud.r-project.org/bin/macosx/big-sur-arm64/base/R-${R_VERSION}-arm64.pkg"
    
    # Print the R version being installed
    echo "Installing R version: $R_VERSION for macOS"
    
    # Download and extract the main Mac Resources directory
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

elif [ "$OS_TYPE" == "windows" ]; then
    # Windows installation
    R_WIN_VERSION="${R_VERSION//./}"  # Remove dots from version number
    R_WIN_URL="https://cloud.r-project.org/bin/windows/base/R-${R_VERSION}-win.exe"
        
    echo "Installing R version: $R_VERSION for Windows"
    
    # Create Windows R directory
    mkdir -p r-win
    cd r-win
    
    # Download R installer
    echo "Downloading R installer from $R_WIN_URL"
    curl -L -o R-installer.exe "$R_WIN_URL"
    
    # Innoextract for Windows (unzip the installer)
    echo "Checking if innoextract_dir already exists..."
    if [ ! -d "innoextract_dir" ]; then
        echo "Downloading innoextract for Windows"
        curl -L -o innoextract.zip "https://constexpr.org/innoextract/files/innoextract-1.9-windows.zip"
        unzip innoextract.zip -d innoextract_dir
        rm innoextract.zip
    else
        echo "innoextract_dir already exists. Skipping download."
    fi
        
    ./innoextract_dir/innoextract.exe --silent R-installer.exe
    
    mv app/* ../r-win
    rm -r app innoextract_dir R-installer.exe 
    rm -r doc tests    
    echo "R for Windows has been installed to $(pwd)/R"    

    echo "pwd: $(pwd)"    

    # Check if Rscript exists in the expected directory
    echo "Checking Rscript location in r-win/bin:"
    ls -l "$(pwd)/bin"

    export PATH="$(pwd)/bin:$PATH"                

    echo "Rscript version"
    Rscript --version

    # 현재 작업 중인 디렉토리 
    echo "Current working directory: $(pwd)"
    cd ..

    echo "Current working directory: $(pwd)"
    Rscript ./add-cran-binary-pkgs.R
fi 

echo "R installation completed for $OS_TYPE"
