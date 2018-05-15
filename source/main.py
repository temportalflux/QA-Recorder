
#from recorder.recorder import runRecorder
#from committer.committer import runCommitter

import os
import sys
import vlc
import logging

from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

from util.struct import Struct
from recorder.tabRecord import Tab as TabRecord
from viewer.tabViewer import Tab as TabView
from util.config import Config
from committer.dialogClone import DialogClone
from committer.committer import GitControl
from util.resources import Resources

# http://doc.qt.io/qt-5/qmainwindow.html
# http://zetcode.com/gui/pyqt5/firstprograms/

class VideoViewer(QMainWindow):
	
	def __init__(self, resources, parent=None):
		super(VideoViewer, self).__init__(parent)
		self.initConfig()
		self.resources = Resources(resources)
		self.initUI()

	def initConfig(self):
		self.savedConfig = Config('config.json')
		self.savedConfig.load()
		self.activeConfig = Config('config.json')
		self.activeConfig.load()
		
	def initUI(self):
		self.initQt()
		self.initWindow()
		self.show()

	def initQt(self):
		QToolTip.setFont(QFont('SansSerif', 10))

	def initWindow(self):
		# icon
		self.setWindowIcon(self.resources.getQIcon('icon'))
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
		self.initMenuFile(self.menus.file)

		self.menus.repository = self.menus.addMenu('Repository')
		self.initMenuRepository(self.menus.repository)

		self.menus.viewer = self.menus.addMenu('Viewer')
		self.initMenuViewer(self.menus.viewer)

	def initAction(self, name, iconName, tip, onTriggered, shortcut=None):
		action = QAction(self.resources.getQIcon(iconName), '&{}'.format(name), self)
		action.setStatusTip(tip)
		action.triggered.connect(onTriggered)
		if shortcut:
			action.setShortcut(shortcut)
		return action

	def initMenuFile(self, menu):
		menu.exit = self.initAction('Exit', 'exit', 'Exit application', qApp.quit, 'Ctrl+Q')
		menu.addAction(menu.exit)

	def initMenuRepository(self, menu):
		self.repoPath = None
		self.committer = GitControl(logging.getLogger('Git'))

		menu.clone = self.initAction('Clone/Pull', 'clone', 'Clone/Pull Repository', self.displayDialogCloneRepo)
		menu.addAction(menu.clone)

		menu.delete = self.initAction('Delete', 'exit', 'Delete Repository', self.deleteRepo)
		menu.addAction(menu.delete)

		self.onRepoPathChanged()

	def initMenuViewer(self, menu):
		menu.openViewerFile = self.initAction('Open', 'open', 'Open Viewer Folder', self.onActionOpen)
		menu.addAction(menu.openViewerFile)

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

	def onActionOpen(self):
		self.view.onActionOpen()

	def displayDialogCloneRepo(self):
		dialog = DialogClone(self.resources, self.committer)
		repoPath = dialog.exec_()
		if repoPath:
			logging.getLogger('').info(repoPath)
			self.repoPath = repoPath
			self.onRepoPathChanged()

	def pullRepo(self):
		pass

	def deleteRepo(self):
		pass

	def onRepoPathChanged(self):
		pathValid = self.repoPath is not None
		self.menus.repository.clone.setEnabled(not pathValid)
		self.menus.repository.delete.setEnabled(pathValid)

	def centerWindow(self):
		qr = self.frameGeometry()
		cp = QDesktopWidget().availableGeometry().center()
		qr.moveCenter(cp)
		self.move(qr.topLeft())

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
