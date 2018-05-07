#!/bin/bash

# Installs python requirements to compile/run the program

python -m pip install --upgrade pip
pip install obs-ws-rc
pip install asyncio
pip install aiohttp
pip install cchardet
pip install aiodns

pip install SIP
pip install PyQt5
pip install python-vlc
