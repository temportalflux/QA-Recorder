
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
from pathlib import Path

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
		self.videoPlayer = VideoPlayer(self,
			self.onVideoScrubComplete, self.onVideoUpdateTick,
			self.getBookmarks, self.onChangeBookmarkWidth)
		sizePolicy = QSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
		sizePolicy.setHorizontalStretch(2)
		self.videoPlayer.setSizePolicy(sizePolicy)
		return self.videoPlayer

	def initInfoArea(self):
		self.commentArea = CommentArea(self)
		sizePolicy = QSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
		sizePolicy.setHorizontalStretch(1)
		self.commentArea.setSizePolicy(sizePolicy)
		return self.commentArea

	def onTabActivated(self):
		pass

	def onBrowsePathChanged(self, path):
		self.videoPlayer.OpenFile(path)

	def onActionOpen(self):
		#self.videoPlayer.OpenFile()

		previousFilename = self.videoPlayer.currentFilename
		if not previousFilename:
			previousFilename = os.path.expanduser('~')
		
		fileName = QFileDialog.getExistingDirectory(
			self, "Select data folder", previousFilename
		)

		if not fileName:
			return

		filePath = Path(fileName)

		filePathVideo = filePath.joinpath(self.activeConfig.data['obs']['recording']['output-name'])
		filePathComments = filePath.joinpath(self.activeConfig.data['viewer']['comments-name'])
		
		self.videoPlayer.OpenFile(str(filePathVideo))
		self.commentArea.OpenFile(str(filePathComments), self.videoPlayer.getDuration(), self.videoPlayer.getBookmarkWidth())

	def onVideoScrubComplete(self, time, totalTime):
		#logging.getLogger('').info("Scrubbed to {}".format(time))
		self.commentArea.onVideoScrubComplete(time, totalTime)

	def onVideoUpdateTick(self, time, totalTime):
		#logging.getLogger('').info("Updated  to {}".format(time))
		self.commentArea.onVideoUpdateTick(time, totalTime)

	def getBookmarks(self):
		return self.commentArea.getBookmarks()

	def onChangeBookmarkWidth(self, totalTime, widthInMs):
		self.commentArea.onChangeBookmarkWidth(totalTime, widthInMs)
		self.repaint()

	def onExecComplete(self):
		pass
