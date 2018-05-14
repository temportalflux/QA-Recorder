
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
from util.struct import Struct
from recorder.tabRecord import Tab as TabRecord
from viewer.tabViewer import Tab as TabView
import vlc
import logging
from util.config import Config

# http://doc.qt.io/qt-5/qmainwindow.html
# http://zetcode.com/gui/pyqt5/firstprograms/

class VideoViewer(QMainWindow):
	
	def __init__(self, resources, parent=None):
		super(VideoViewer, self).__init__(parent)
		self.resourcesDir = resources
		self.initConfig()
		self.initResources()
		self.initUI()

	def initConfig(self):
		self.savedConfig = Config('config.json')
		self.savedConfig.load()
		self.activeConfig = Config('config.json')
		self.activeConfig.load()

	def initResources(self):
		self.resources = {
			'icon': 'icons/icon.png'
		}
		for key,value in self.resources.items():
			self.resources[key] = os.path.join(self.resourcesDir, value)
		
	def initUI(self):
		self.initQt()
		self.initWindow()
		self.show()

	def initQt(self):
		QToolTip.setFont(QFont('SansSerif', 10))

	def initWindow(self):
		# icon
		self.setWindowIcon(QIcon(self.resources['icon']))
		# title
		self.setWindowTitle('QA Viewer')

		#self.initActions()
		w, h = self.initContent()

		# position/location
		self.resize(w, h)
		self.centerWindow()

	#def initActions(self):
	#	self.actions = Struct()

		#self.actions.exit = QAction(QIcon('exit.png'), '&Exit', self)
		#self.actions.exit.setShortcut('Ctrl+Q')
		#self.actions.exit.setStatusTip('Exit application')
		#self.actions.exit.triggered.connect(qApp.quit)

		#self.actions.open = QAction(QIcon('open.png'), '&Open', self)
		#self.actions.open.setShortcut('Ctrl+O')
		#self.actions.open.setStatusTip('Open Data')
		#self.actions.open.triggered.connect(self.openData)

	def initContent(self):

		tabs = self.initWindowTabs()
		self.setCentralWidget(tabs)

		#self.statusBar().showMessage('Ready')

		return (600, 600)

	def initWindowTabs(self):
		tabs = QTabWidget()
		
		self.record = TabRecord(self)
		tabs.addTab(self.record, self.record.tabLabel)
		
		self.view = TabView(self)
		tabs.addTab(self.view, self.view.tabLabel)

		return tabs

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

	def onExecComplete(self):
		self.record.onExecComplete()
		self.view.onExecComplete()

def run():
	logging.basicConfig(
		level=logging.INFO,
		format='%(levelname)7s: %(message)s',
		stream=sys.stderr,
	)

	app = QApplication(sys.argv)
	ex = VideoViewer(os.path.join(os.getcwd(), 'resources'))
	# halt while app is running
	app.exec_()
	# destroy everything
	ex.onExecComplete()
		
if __name__ == '__main__':
	run()
