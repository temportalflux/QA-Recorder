
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

class Tab(QWidget):

	def __init__(self, parent=None):
		super(Tab, self).__init__(parent)
		self.tabLabel = "Record"
		self.initContent()

	def initContent(self):
		pass
