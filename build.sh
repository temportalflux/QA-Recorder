#!/bin/bash

# remove old builds
rm -rf build
rm -rf dist

# build
pyinstaller source/obs-python.py
