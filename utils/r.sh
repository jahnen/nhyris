# Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn
# Copyright (c) 2023 Jinhwan Kim

#!/usr/bin/env bash
set -e

# Detect operating system

OS_TYPE="unknown"
if [ "$OSTYPE" != "" ] && echo "$OSTYPE" | grep -q "^darwin"; then
    OS_TYPE="macos"
elif [ "$OSTYPE" = "msys" ] || [ "$OSTYPE" = "cygwin" ] || echo "$OSTYPE" | grep -q "^win"; then
    OS_TYPE="windows"
elif [ "$(uname)" = "Linux" ]; then
    OS_TYPE="linux"
fi



echo "Detected OS: $OS_TYPE"

# Define the R version explicitly
# Chosen for compatibility with specific dependencies
R_VERSION="4.5.0"

if [ "$OS_TYPE" = "macos" ]; then
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

elif [ "$OS_TYPE" = "windows" ]; then
    # Windows installation
    R_WIN_VERSION="${R_VERSION//./}" # Remove dots from version number
    R_WIN_URL="https://cloud.r-project.org/bin/windows/base/R-${R_VERSION}-win.exe"

    echo "Installing R version: $R_VERSION for Windows"

    # Create Windows R directory
    mkdir -p r-win
    cd r-win

    # Download R installer    
    curl -L -o R-installer.exe "$R_WIN_URL"

    # Innoextract for Windows (unzip the installer)    
    if [ ! -d "innoextract_dir" ]; then        
        curl -L -o innoextract.zip "https://constexpr.org/innoextract/files/innoextract-1.9-windows.zip"
        unzip innoextract.zip -d innoextract_dir
        rm innoextract.zip    
        ./innoextract_dir/innoextract.exe --silent R-installer.exe

        mv app/* .          
        rm -r innoextract_dir
    fi    

    rm -r app R-installer.exe
    rm -r doc tests Tcl        
elif [ "$OS_TYPE" = "linux" ]; then
    # Linux (Ubuntu) local R installation
    echo "Installing R version: $R_VERSION for Linux (Ubuntu) (local build)"

    # Create a directory for the local R
    mkdir -p r-linux
    cd r-linux

    # Install the necessary build dependencies
    sudo sed -i.bak "/^#.*deb-src.*universe$/s/^# //g" /etc/apt/sources.list
    sudo apt-get update
    sudo apt-get build-dep -y r-base
    sudo apt-get install -y --no-install-recommends curl build-essential gfortran libreadline-dev libx11-dev libxt-dev libpng-dev libjpeg-dev libcairo2-dev libssl-dev libbz2-dev libzstd-dev liblzma-dev libcurl4-openssl-dev libicu-dev
        
    # Check for missing packages
    missing_pkgs=""
    for pkg in build-essential gfortran libreadline-dev libx11-dev libxt-dev libpng-dev libjpeg-dev libcairo2-dev libssl-dev libbz2-dev libzstd-dev liblzma-dev libcurl4-openssl-dev libicu-dev; do
        dpkg -s $pkg &> /dev/null || missing_pkgs="$missing_pkgs $pkg"
    done
    if [ -n "$missing_pkgs" ]; then
        echo "The following packages are missing and will be installed: $missing_pkgs"
        sudo apt-get install -y --no-install-recommends $missing_pkgs
    fi

    # Download and extract the version of R that you want to install
    R_MAJOR=$(echo "$R_VERSION" | cut -d. -f1)
    curl -O https://cran.rstudio.com/src/base/R-${R_MAJOR}/R-${R_VERSION}.tar.gz
    tar -xzvf R-${R_VERSION}.tar.gz
    cd R-${R_VERSION}

    # Build and install R
    ./configure \
        --prefix="$(pwd)/.." \
        --enable-memory-profiling \
        --enable-R-shlib \
        --with-blas \
        --with-lapack

    make
    make install

    # Test that R was successfully installed
    ../bin/R --version

    # Remove downloaded tar.gz file
    cd ..
    rm -f R-${R_VERSION}.tar.gz

    cd ../..
fi

echo "R installation completed for $OS_TYPE"
