# aev-software

# OUT OF DATE: WILL BE UPDATED SOON
_____

## Description

This repository contains the software for the Advanced Experimental Vehicles :car: (AEV) club at Florida Atlantic University Highschool :school:. The software is an Electron application and its frontend is written in Nuxt. The software is used to control the AEV's hardware, such as the motors, sensors, and other components. The software is also used to collect data from the AEV's sensors and store it. The software is written by, in no specific order, Amarnath Patel, Zachary Lopez, Jossaya Camille, and Thandi Menelas. 

## Building
This application was specifically written to be used on Arch Linux, specifically the ARM Arch Linux project, due to the CPU architecture of Raspberry Pi. The software can be built on other systems, but the Tauri preqrequesits may vary. On Arch Linux ARM, the following packages are required:
```
sudo pacman -Syu
sudo pacman -S --needed \
    webkit2gtk \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg \
    libvips
```

You will also need `rust` installed. Usually distrubuted with either `rustup` or the generic `rust` package on the Arch repositories through pacman or what ever helper of your choice.

Clone the repository, and run the following commands:
`npm install && npm run tauri dev`

## Licensing

This repository utilizes the extremely lenient MIT License.
```
Copyright (c) 2024 Yaman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```




hol on for cpp u need qt5-serialport qt5-3d qt6-3d qt6-shadertools qt5-base qt6-base qt5-wayland qt6-wayland