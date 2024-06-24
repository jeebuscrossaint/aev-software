#!/usr/bin/env bash

# Tested OS: Arch Linux for ARM
# Requirements: node, npm, git, tmux, gpsd

# Clone the repository
# echo "Cloning the repository..."
# git clone https://github.com/jeebuscrossaint/aev-software ~/aev-software

# Symlink Hyprland and AGS configuration
echo "Symlinking Hyprland and AGS configuration..."
mv ~/.config/hypr ~/.config/hypr.bak
ln -sf ~/aev-software/src/hyprland/hypr ~/.config/hypr
mv ~/.config/ags ~/.config/ags.bak
ln -sf ~/aev-software/src/hyprland/ags-str1ke ~/.config/ags

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ~/aev-software/src/js/frontend
npm install

# Install serialport dependencies
echo "Installing serialport dependencies..."
cd ~/aev-software/src/js/serialport
npm install
