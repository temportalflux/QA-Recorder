
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

class ScrubBar(QSlider):

	def __init__(self, parent=None, getBookmarks=None):
		super(ScrubBar, self).__init__(Qt.Horizontal, parent)
		self.getBookmarks = getBookmarks

	def paintEvent(self, e):
		self.paintBookmarks()
		super(ScrubBar, self).paintEvent(e)

	def paintBookmarks(self):
		painter = QPainter()
		painter.begin(self)
		self.drawBookmarks(painter)
		painter.end()

	def drawBookmarks(self, painter):
		col = QColor(0, 0, 0)
		col.setNamedColor('#d4d4d4')
		painter.setPen(col)

		painter.setBrush(QColor(230, 255, 90))
		# x y w h
		if self.getBookmarks is not None:
			for bookmark in self.getBookmarks():
				self.drawBookmark(painter, bookmark[0], bookmark[1])

	def drawBookmark(self, painter, start, end):
		totalSize = self.size()
		painter.drawRect(start * totalSize.width(), 0, (end - start) * totalSize.width(), totalSize.height())

