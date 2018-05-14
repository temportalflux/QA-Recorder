
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

class CommentArea(QWidget):

	def __init__(self, parent=None):
		super(CommentArea, self).__init__(parent)
		self.initContent()

	def initContent(self):
		layout = QVBoxLayout()

		layout.addWidget(QLabel("Comments"))
		layout.addWidget(self.initScrollArea())

		self.setLayout(layout)

	def initScrollArea(self):
		scroll = QScrollArea(self)
		scrollWidget = QWidget(scroll)

		self.initScrollContent(scrollWidget)

		scroll.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOn)
		scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
		scroll.setWidgetResizable(True)

		return scroll

	def initScrollContent(self, parent):
		self.commentWidget = parent

		

