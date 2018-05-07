
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

# http://doc.qt.io/qt-5/qmainwindow.html
# http://zetcode.com/gui/pyqt5/firstprograms/

class Struct(object): pass

class VideoViewer(QMainWindow):
	
	def __init__(self, resources):
		super().__init__()
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
		self.initQt()
		self.initWindow()
		self.show()

	def initQt(self):
		QToolTip.setFont(QFont('SansSerif', 10))

	def initWindow(self):
		# icon
		self.setWindowIcon(QIcon(self.resources['icon']))
		# title
		self.setWindowTitle('Center')

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

	def initContent(self):

		menubar = self.menuBar()
		fileMenu = menubar.addMenu('&File')
		fileMenu.addAction(self.actions.exit)

		# https://pythonprogramminglanguage.com/pyqt5-video-widget/
		# https://www.youtube.com/watch?v=tGKmQy-VBX0
		# https://www.youtube.com/watch?v=PutunNtVpto
		#videoPlayer = QMediaPlayer()

		self.statusBar().showMessage('Ready')

		return (250, 150)

	def centerWindow(self):
		qr = self.frameGeometry()
		cp = QDesktopWidget().availableGeometry().center()
		qr.moveCenter(cp)
		self.move(qr.topLeft())

def run():
	app = QApplication(sys.argv)
	ex = VideoViewer(os.path.join(os.getcwd(), 'resources'))
	sys.exit(app.exec_())
		
if __name__ == '__main__':
	run()
