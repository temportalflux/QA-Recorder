
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

from util.browseBar import Browse
from viewer.videoPlayer import VideoPlayer
import os
import logging
from viewer.commentArea import CommentArea

class Tab(QWidget):

	def __init__(self, parent=None):
		super(Tab, self).__init__(parent)
		self.tabLabel = "View"
		self.activeConfig = parent.activeConfig
		self.initContent()

	def initContent(self):
		layout = QHBoxLayout()

		layout.addWidget(self.initVideoPlayer())
		layout.addWidget(self.initInfoArea())

		self.setLayout(layout)

	def initVideoPlayer(self):
		self.videoPlayer = VideoPlayer(self)
		sizePolicy = QSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
		sizePolicy.setHorizontalStretch(2)
		self.videoPlayer.setSizePolicy(sizePolicy)
		return self.videoPlayer

	def initInfoArea(self):
		widget = CommentArea(self)
		sizePolicy = QSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
		sizePolicy.setHorizontalStretch(1)
		widget.setSizePolicy(sizePolicy)
		return widget

	def onTabActivated(self):
		pass

	def onBrowsePathChanged(self, path):
		self.videoPlayer.OpenFile(path)

	def onExecComplete(self):
		pass
