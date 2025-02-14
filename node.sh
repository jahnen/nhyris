# Copyright (c) 2025 Jinhwan Kim
#!/bin/bash

# check node.js installed
if command -v node &> /dev/null
then
    echo "Node.js is already installed. Version: $(node -v)"
    exit 0
else
    echo "Node.js is not installed. Installing now..."
fi

# using nvm to install node.js
echo "Installing nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# check install nvm success
if ! command -v nvm &> /dev/null
then
    echo "NVM installation failed. Exiting..."
    exit 1
fi

# install node.js
echo "Installing Node.js LTS..."
nvm install --lts

# check node.js installation
if command -v node &> /dev/null; then
    echo "Node.js installation successful. Version: $(node -v)"
else
    echo "Node.js installation failed."
    exit 1
fi
