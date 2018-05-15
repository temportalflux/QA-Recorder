
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

import logging
import json
import datetime

class CommentArea(QWidget):

	def __init__(self, parent=None):
		super(CommentArea, self).__init__(parent)
		
		self.loadedComments = {}
		self.prunedComments = {}
		self.activeComments = []
		self.bookmarks = []

		self.initContent()

	def initContent(self):
		layout = QVBoxLayout()

		layout.addWidget(QLabel("Comments"))
		layout.addWidget(self.initScrollArea())

		self.setLayout(layout)

	def initScrollArea(self):
		scroll = QScrollArea(self)
		scrollWidget = QWidget(scroll)
		scroll.setWidget(scrollWidget)

		self.initScrollContent(scrollWidget)

		scroll.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOn)
		scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
		scroll.setWidgetResizable(True)

		return scroll

	def initScrollContent(self, parent):
		self.widgetCommentArea = parent
		self.layoutCommentArea = QVBoxLayout()
		parent.setLayout(self.layoutCommentArea)

	def OpenFile(self, path, totalTime, widthInMs):
		self.loadedComments = self.loadJson(path)
		self.createBookmarks(totalTime, widthInMs)

	def loadJson(self, filePath):
		data = {}
		with open(filePath) as file:
			data = json.loads(file.read())
		return data

	def onVideoScrubComplete(self, time, totalTime):
		self.prunedComments = {}
		for timestamp, comment in self.loadedComments.items():
			if int(timestamp) > time:
				self.prunedComments[timestamp] = comment

		self.clearComments()
		self.selectComments(time)

	def onVideoUpdateTick(self, time, totalTime):
		self.clearComments()
		self.selectComments(time)

	def clearComments(self):
		self.clearLayout(self.layoutCommentArea)
		self.activeComments = []

	def selectComments(self, timeInMs):
		height = 0
		for timestamp, comment in self.prunedComments.items():
			bookmarkTimeInMs = int(timestamp)
			hasStarted = bookmarkTimeInMs - self.bookmarkWidthInMs <= timeInMs
			hasNotEnded = timeInMs <= bookmarkTimeInMs + self.bookmarkWidthInMs			
			if hasStarted and hasNotEnded:
				height += self.addComment(timestamp, comment)
				self.activeComments.append({'time': bookmarkTimeInMs, 'comment': comment})

		self.widgetCommentArea.setMaximumHeight(height)		

	def clearLayout(self, layout):
		if layout is not None:
			while layout.count():
				item = layout.takeAt(0)
				widget = item.widget()
				if widget is not None:
					widget.deleteLater()
				else:
					self.clearLayout(item.layout())

	def addComment(self, timestamp, comment):
		widget = QWidget(self.widgetCommentArea)
		layout = QVBoxLayout()

		height = 0

		hours, minutes, seconds = self.convert_timedelta(datetime.timedelta(milliseconds=int(timestamp)))
		timestampText = '{0:02d}:{1:02d}:{2:02d}'.format(hours, minutes, seconds)
		widgetTimestamp = QLabel(timestampText)
		height += widgetTimestamp.sizeHint().height()
		layout.addWidget(widgetTimestamp)

		widgetComment = QLabel(comment)
		height += widgetComment.sizeHint().height()
		layout.addWidget(widgetComment)

		widget.setLayout(layout)

		height *= 2
		widget.setMinimumHeight(height)
		widget.setMaximumHeight(height)

		self.layoutCommentArea.addWidget(widget)

		return height

	def convert_timedelta(self, duration):
		days, seconds = duration.days, duration.seconds
		hours = days * 24 + seconds // 3600
		minutes = (seconds % 3600) // 60
		seconds = (seconds % 60)
		return hours, minutes, seconds

	def createBookmarks(self, totalTime, widthInMs):
		self.bookmarkWidthInMs = widthInMs
		#logging.getLogger('').info(self.activeComments)
		self.bookmarks = []
		#[
		#	[0, 0.1],
		#	[0.5, 0.55],
		#	[0.9, 1.0]
		#]
		for timestamp, comment in self.loadedComments.items():
			time = int(timestamp)
			start = max(time - widthInMs, 0) / totalTime
			end = min(time + widthInMs, totalTime) / totalTime
			self.bookmarks.append([start, end])

	def getBookmarks(self):
		return self.bookmarks

	def onChangeBookmarkWidth(self, totalTime, widthInMs):
		self.createBookmarks(totalTime, widthInMs)
		self.repaint()
