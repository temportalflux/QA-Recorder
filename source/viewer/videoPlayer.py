#! /usr/bin/python

#
# Qt example for VLC Python bindings
# Copyright (C) 2009-2010 the VideoLAN team
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
#

from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

import sys
import os.path
import vlc
import logging
from viewer.scrubBar import ScrubBar
import datetime

class VideoPlayer(QWidget):

	def __init__(self, parent=None, onScrubComplete=None, onUpdateTick=None, getBookmarks=None, onChangeBookmarkWidth=None):
		super(VideoPlayer, self).__init__(parent)

		self.currentFilename = None
		self.onScrubComplete = onScrubComplete
		self.onUpdateTick = onUpdateTick
		self.getBookmarks = getBookmarks
		self.onChangeBookmarkWidth = onChangeBookmarkWidth

		# creating a basic vlc instance
		self.instance = vlc.Instance()
		# creating an empty vlc media player
		self.mediaplayer = self.instance.media_player_new()

		self.createUI()
		self.isPaused = False
		self.scrubberPressed_wasPaused = True

	def createUI(self):
		"""Set up the user interface, signals & slots
		"""

		# In this widget, the video will be drawn
		if sys.platform == "darwin": # for MacOS
			from PyQt5.QtWidgets import QMacCocoaViewContainer  
			self.videoframe = QMacCocoaViewContainer(0)
		else:
			self.videoframe = QFrame()

		self.palette = self.videoframe.palette()
		self.palette.setColor (QPalette.Window,
								QColor(0,0,0))
		self.videoframe.setPalette(self.palette)
		self.videoframe.setAutoFillBackground(True)

		self.hboxScrub = QHBoxLayout()

		self.labelTime = QLabel('00:00:00')
		self.labelTime.setMaximumHeight(20)
		self.hboxScrub.addWidget(self.labelTime)

		self.positionslider = ScrubBar(self, self.getBookmarks)
		self.positionslider.setToolTip("Position")
		self.positionslider.setMaximum(1000)
		self.positionslider.sliderPressed.connect(self.onScrubberPressed)
		self.positionslider.sliderMoved.connect(self.onScrubberMoved)
		self.positionslider.sliderReleased.connect(self.onScrubberReleased)
		self.hboxScrub.addWidget(self.positionslider)

		self.labelDuration = QLabel('00:00:00')
		self.labelDuration.setMaximumHeight(20)
		self.hboxScrub.addWidget(self.labelDuration)

		self.hbuttonbox = QHBoxLayout()

		self.playbutton = QPushButton("Play")
		self.hbuttonbox.addWidget(self.playbutton)
		self.playbutton.clicked.connect(self.PlayPause)

		self.stopbutton = QPushButton("Stop")
		self.hbuttonbox.addWidget(self.stopbutton)
		self.stopbutton.clicked.connect(self.Stop)

		self.hbuttonbox.addStretch(1.0)

		self.bookmarkslider = QSlider(Qt.Horizontal, self)
		self.bookmarkslider.setMaximum(3000)
		self.bookmarkslider.setValue(1000)
		self.bookmarkslider.setToolTip("Bookmark Width")
		self.bookmarkslider.valueChanged.connect(self.setBookmarkWidth)
		self.bookmarkslider.setEnabled(False)
		self.hbuttonbox.addWidget(self.bookmarkslider)

		#self.hbuttonbox.addStretch(0.1)

		self.volumeslider = QSlider(Qt.Horizontal, self)
		self.volumeslider.setMaximum(100)
		self.volumeslider.setValue(self.mediaplayer.audio_get_volume())
		self.volumeslider.setToolTip("Volume")
		self.hbuttonbox.addWidget(self.volumeslider)
		self.volumeslider.valueChanged.connect(self.setVolume)

		self.vboxlayout = QVBoxLayout()
		self.vboxlayout.addWidget(self.videoframe)
		self.vboxlayout.addLayout(self.hboxScrub)
		self.vboxlayout.addLayout(self.hbuttonbox)

		self.setLayout(self.vboxlayout)

		#open = QAction("&Open", self)
		#open.triggered.connect(self.OpenFile)
		#exit = QAction("&Exit", self)
		#exit.triggered.connect(sys.exit)
		#menubar = self.menuBar()
		#filemenu = menubar.addMenu("&File")
		#filemenu.addAction(open)
		#filemenu.addSeparator()
		#filemenu.addAction(exit)

		self.timer = QTimer(self)
		self.timer.setInterval(200)
		self.timer.timeout.connect(self.updateUI)

	def PlayPause(self):
		"""Toggle play/pause status
		"""
		if self.mediaplayer.is_playing():
			self.mediaplayer.pause()
			self.playbutton.setText("Play")
			self.isPaused = True
		else:
			if self.mediaplayer.play() == -1:
				#self.OpenFile()
				return
			self.mediaplayer.play()
			self.playbutton.setText("Pause")
			self.timer.start()
			self.isPaused = False

	def Stop(self):
		"""Stop player
		"""
		self.mediaplayer.stop()
		self.playbutton.setText("Play")

	def OpenFile(self, filename=None):
		"""Open a media file in a MediaPlayer
		"""
		if filename is None:
			previousFilename = self.currentFilename
			if not previousFilename:
				previousFilename = os.path.expanduser('~')
			filename = QFileDialog.getOpenFileName(self, "Open File", previousFilename)[0]
		if not filename:
			return

		self.currentFilename = filename

		# create the media
		if sys.version < '3':
			filename = unicode(filename)
		self.media = self.instance.media_new(filename)
		# put the media in the media player
		self.mediaplayer.set_media(self.media)

		# parse the metadata of the file
		self.media.parse()

		# the media player has to be 'connected' to the QFrame
		# (otherwise a video would be displayed in it's own window)
		# this is platform specific!
		# you have to give the id of the QFrame (or similar object) to
		# vlc, different platforms have different functions for this
		if sys.platform.startswith('linux'): # for Linux using the X Server
			self.mediaplayer.set_xwindow(self.videoframe.winId())
		elif sys.platform == "win32": # for Windows
			self.mediaplayer.set_hwnd(self.videoframe.winId())
		elif sys.platform == "darwin": # for MacOS
			self.mediaplayer.set_nsobject(int(self.videoframe.winId()))

		self.bookmarkslider.setEnabled(True)
		self.labelDuration.setText(self.getDurationStr())

		w, h = self.mediaplayer.video_get_size()
		self.onMediaChanged(w, h)
		
	def setVolume(self, Volume):
		"""Set the volume
		"""
		self.mediaplayer.audio_set_volume(Volume)

	def onScrubberPressed(self):
		self.scrubberPressed_wasPaused = self.isPaused
		if not self.isPaused:
			self.PlayPause()

	def onScrubberMoved(self, position):
		"""Set the position
		"""
		# setting the position to where the slider was dragged
		self.mediaplayer.set_position(position / 1000.0)
		# the vlc MediaPlayer needs a float value between 0 and 1, Qt
		# uses integer variables, so you need a factor; the higher the
		# factor, the more precise are the results
		# (1000 should be enough)
		self.labelTime.setText(self.msToHMS(self.mediaplayer.get_time()))

	def onScrubberReleased(self):
		self.onScrubComplete(self.mediaplayer.get_time(), self.getDuration())
		if not self.scrubberPressed_wasPaused:
			self.PlayPause()

	def updateUI(self):
		"""updates the user interface"""
		# setting the slider to the desired position
		self.positionslider.setValue(self.mediaplayer.get_position() * 1000)
		self.labelTime.setText(self.msToHMS(self.mediaplayer.get_time()))
		
		self.onUpdateTick(self.mediaplayer.get_time(), self.getDuration())

		if not self.mediaplayer.is_playing():
			# no need to call this function if nothing is played
			self.timer.stop()
			if not self.isPaused:
				# after the video finished, the play button stills shows
				# "Pause", not the desired behavior of a media player
				# this will fix it
				self.Stop()

	def getDuration(self):
		#return self.mediaplayer.get_length()
		return self.media.get_duration()

	def onMediaChanged(self, width, height):
		pass
		#newWidth = self.size().width()
		#newHeight = newWidth * (height / width)
		#self.videoframe.setMinimumWidth(newWidth)
		#self.videoframe.setMinimumHeight(newHeight)

	def getBookmarkWidth(self):
		return self.bookmarkslider.value()

	def setBookmarkWidth(self, value):
		self.onChangeBookmarkWidth(self.getDuration(), self.getBookmarkWidth())

	def getDurationStr(self):
		return self.msToHMS(self.getDuration())

	def msToHMS(self, ms):
		duration = datetime.timedelta(milliseconds=ms)
		days, seconds = duration.days, duration.seconds
		hours = days * 24 + seconds // 3600
		minutes = (seconds % 3600) // 60
		seconds = (seconds % 60)
		return '{0:02d}:{1:02d}:{2:02d}'.format(hours, minutes, seconds)