
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

		self.initMenuBar()
		w, h = self.initContent()

		# position/location
		self.resize(w, h)
		self.centerWindow()

	def initMenuBar(self):
		self.menus = self.menuBar()

		self.menus.file = self.menus.addMenu('File')

		self.menus.file.exit = QAction(QIcon('exit.png'), '&Exit', self)
		self.menus.file.exit.setShortcut('Ctrl+Q')
		self.menus.file.exit.setStatusTip('Exit application')
		self.menus.file.exit.triggered.connect(qApp.quit)
		self.menus.file.addAction(self.menus.file.exit)

		self.menus.viewer = self.menus.addMenu('Viewer')

		self.menus.viewer.openViewerFile = QAction(QIcon('open.png'), '&Open', self)
		#self.menus.viewer.openViewerFile.setShortcut('Ctrl+O')
		self.menus.viewer.openViewerFile.setStatusTip('Open Viewer Folder')
		self.menus.viewer.openViewerFile.triggered.connect(self.openViewerFolder)
		self.menus.viewer.addAction(self.menus.viewer.openViewerFile)

	def initContent(self):

		tabs = self.initWindowTabs()
		self.setCentralWidget(tabs)

		#self.statusBar().showMessage('Ready')

		return (800, 600)

	def initWindowTabs(self):
		self.tabs = QTabWidget()
		
		self.record = TabRecord(self)
		self.tabs.addTab(self.record, self.record.tabLabel)
		
		self.view = TabView(self)
		self.tabs.addTab(self.view, self.view.tabLabel)


		self.tabs.currentChanged.connect(self.onTabChanged)
		self.onTabChanged(0)

		return self.tabs

	def onTabChanged(self, tabIndex):
		self.tabs.widget(tabIndex).onTabActivated()
		self.menus.viewer.setEnabled(tabIndex == 1)

	def centerWindow(self):
		qr = self.frameGeometry()
		cp = QDesktopWidget().availableGeometry().center()
		qr.moveCenter(cp)
		self.move(qr.topLeft())

	def openViewerFolder(self):
		self.view.videoPlayer.OpenFile()

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
