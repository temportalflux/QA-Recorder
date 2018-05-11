
#from recorder.recorder import runRecorder
#from committer.committer import runCommitter

import os
import sys
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *
import vlc

# http://doc.qt.io/qt-5/qmainwindow.html
# http://zetcode.com/gui/pyqt5/firstprograms/

class Struct(object): pass

class VideoViewer(QMainWindow):
	
	def __init__(self, resources, parent=None):
		super(VideoViewer, self).__init__(parent)
		self.resourcesDir = resources
		self.initResources()
		self.initUI()

	def initResources(self):
		self.resources = {
			'icon': 'icons/icon.png'
		}
		for key,value in self.resources.items():
			self.resources[key] = os.path.join(self.resourcesDir, value)
		
	def initUI(self):
		self.initVLC()
		self.initQt()
		self.initWindow()
		self.show()

	def initVLC(self):
		# creating a basic vlc instance
		self.instance = vlc.Instance()
		# creating an empty vlc media player
		self.vlcPlayer = self.instance.media_player_new()
		self.vlcPlayer.audio_set_volume(100)

	def initQt(self):
		QToolTip.setFont(QFont('SansSerif', 10))

	def initWindow(self):
		# icon
		self.setWindowIcon(QIcon(self.resources['icon']))
		# title
		self.setWindowTitle('QA Video Player')

		self.initActions()
		w,h = self.initContent()

		# position/location
		self.resize(w, h)
		self.centerWindow()

	def initActions(self):
		self.actions = Struct()

		self.actions.exit = QAction(QIcon('exit.png'), '&Exit', self)
		self.actions.exit.setShortcut('Ctrl+Q')
		self.actions.exit.setStatusTip('Exit application')
		self.actions.exit.triggered.connect(qApp.quit)

		self.actions.open = QAction(QIcon('open.png'), '&Open', self)
		self.actions.open.setShortcut('Ctrl+O')
		self.actions.open.setStatusTip('Open Data')
		self.actions.open.triggered.connect(self.openData)

	def initContent(self):

		# Create a widget for window contents
		self.contentWidget = QWidget(self)
		self.setCentralWidget(self.contentWidget)

		# In this widget, the video will be drawn
		self.videoframe = QFrame()
		self.palette = self.videoframe.palette()
		self.palette.setColor(
			QPalette.Window,
			QColor(0,0,0)
		)
		self.videoframe.setPalette(self.palette)
		self.videoframe.setAutoFillBackground(True)

		self.buttons = Struct()
		#self.buttons.play = QPushButton()
		#self.buttons.play.setEnabled(False)
		#self.buttons.play.setIcon(self.style().standardIcon(QStyle.SP_MediaPlay))
		#self.buttons.play.clicked.connect(self.play)

		self.vboxlayout = QVBoxLayout()
		self.vboxlayout.addWidget(self.videoframe)
		#self.vboxlayout.addWidget(self.positionslider)
		#self.vboxlayout.addLayout(self.hbuttonbox)

		self.contentWidget.setLayout(self.vboxlayout)

		menubar = self.menuBar()
		self.menus = Struct()
		self.menus.file = menubar.addMenu('&File')
		self.menus.file.addAction(self.actions.open)
		self.menus.file.addSeparator()
		self.menus.file.addAction(self.actions.exit)

		# https://pythonprogramminglanguage.com/pyqt5-video-widget/
		# https://www.youtube.com/watch?v=tGKmQy-VBX0
		# https://www.youtube.com/watch?v=PutunNtVpto
		#videoPlayer = QMediaPlayer()
		# https://pythonprogramminglanguage.com/pyqt5-video-widget/
		#self.mediaPlayer = QMediaPlayer(None, QMediaPlayer.VideoSurface)
#
		#self.videoWidget = QVideoWidget()
#
		#self.positionSlider = QSlider(Qt.Horizontal)
		#self.positionSlider.setRange(0, 0)
		#self.positionSlider.sliderMoved.connect(self.setPosition)
#
		#self.errorLabel = QLabel()
		#self.errorLabel.setSizePolicy(
		#	QSizePolicy.Preferred, QSizePolicy.Maximum
		#)

		# Create layouts to place inside widget
		#controlLayout = QHBoxLayout()
		#controlLayout.setContentsMargins(0, 0, 0, 0)
		#controlLayout.addWidget(self.playButton)
		#controlLayout.addWidget(self.positionSlider)

		#layout = QVBoxLayout()
		#layout.addWidget(self.videoWidget)
		#layout.addLayout(controlLayout)
		#layout.addWidget(self.errorLabel)

		# Set widget to contain window contents
		#wid.setLayout(layout)

		#self.mediaPlayer.setVideoOutput(self.videoWidget)
		#self.mediaPlayer.stateChanged.connect(self.mediaStateChanged)
		#self.mediaPlayer.positionChanged.connect(self.positionChanged)
		#self.mediaPlayer.durationChanged.connect(self.durationChanged)
		#self.mediaPlayer.error.connect(self.handleError)

		#self.statusBar().showMessage('Ready')

		return (600, 400)

	def centerWindow(self):
		qr = self.frameGeometry()
		cp = QDesktopWidget().availableGeometry().center()
		qr.moveCenter(cp)
		self.move(qr.topLeft())

	def openData(self, filename=None):
		"""Open a media file in a MediaPlayer
		"""
		if filename is None:
			fileName, _ = QFileDialog.getOpenFileName(
				self, "Open Data", QDir.homePath()
			)
		if not filename or fileName == '':
			return

		# create the media
		self.media = self.instance.media_new(unicode(filename))
		# put the media in the media player
		self.vlcPlayer.set_media(self.media)

		# parse the metadata of the file
		self.media.parse()
		# set the title of the track as window title
		self.setWindowTitle(self.media.get_meta(0))

		# the media player has to be 'connected' to the QFrame
		# (otherwise a video would be displayed in it's own window)
		# this is platform specific!
		# you have to give the id of the QFrame (or similar object) to
		# vlc, different platforms have different functions for this
		if sys.platform == "linux2": # for Linux using the X Server
			self.vlcPlayer.set_xwindow(self.videoframe.winId())
		elif sys.platform == "win32": # for Windows
			self.vlcPlayer.set_hwnd(self.videoframe.winId())
		elif sys.platform == "darwin": # for MacOS
			self.vlcPlayer.set_agl(self.videoframe.windId())

def run():
	app = QApplication(sys.argv)
	ex = VideoViewer(os.path.join(os.getcwd(), 'resources'))
	sys.exit(app.exec_())
		
if __name__ == '__main__':
	run()
