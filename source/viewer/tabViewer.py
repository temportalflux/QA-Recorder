
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

from util.browseBar import Browse
from viewer.videoPlayer import VideoPlayer
import os

class Tab(QWidget):

	def __init__(self, parent=None):
		super(Tab, self).__init__(parent)
		self.tabLabel = "View"
		self.activeConfig = parent.activeConfig
		self.initContent()

	def initContent(self):
		layout = QVBoxLayout()

		layout.addWidget(self.initBrowseBar())
		layout.addWidget(self.initVideoPlayer())

		self.setLayout(layout)

	def initBrowseBar(self):
		return Browse("Browse",
			{
				'absolute': True,
				'path': os.getcwd(),
				'file': ''
			},
			'*.mp4', self.onBrowsePathChanged)

	def initVideoPlayer(self):
		self.videoPlayer = VideoPlayer(self)
		return self.videoPlayer

	def onBrowsePathChanged(self, path):
		self.videoPlayer.OpenFile(path)

	def onExecComplete(self):
		pass
