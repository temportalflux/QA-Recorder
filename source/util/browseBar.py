
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

from pathlib import Path
from lib.pathHelper import *
from lib.pathObject import PathObject

class Browse(QGroupBox):

	def __init__(self, name, target, filter="*", onPathChanged=None, onAnyChange=None):
		super(Browse, self).__init__(name)
		self.pathObject = PathObject(target)

		self.dialogFilter = filter
		self.onPathChanged = onPathChanged
		self.onAnyChange = onAnyChange

		self.initContent()

		self.setMaximumHeight(100)

	def getIcon(self, icon):
		return self.style().standardIcon(icon)

	def setIconFor(self, btn, icon):
		btn.setIcon(self.getIcon(icon))

	def initContent(self):
		layout = QVBoxLayout()

		layout.addWidget(self.initBar())
		layout.addWidget(self.initInfo())

		self.setLayout(layout)

	def initBar(self):
		widget = QWidget(self)
		layout = QHBoxLayout()

		self.textBox = QLineEdit(self)
		self.textBox.setText(self.pathObject.getPathAbsoluteWithFile())
		self.textBox.setMinimumHeight(20)
		self.textBox.textChanged.connect(self.onBrowseChanged)
		layout.addWidget(self.textBox)

		self.btn = QPushButton()
		self.btn.setMinimumHeight(20)
		self.setIconFor(self.btn, QStyle.SP_DialogOpenButton)
		self.btn.clicked.connect(self.onClickedBrowse)
		layout.addWidget(self.btn)

		widget.setLayout(layout)
		return widget

	def initInfo(self):
		widget = QWidget(self)
		layout = QHBoxLayout()

		self.errorLabel = QLabel()
		self.errorLabel.setMinimumHeight(20)
		self.errorLabel.setMinimumWidth(350)
		self.errorLabel.setStyleSheet('color: red;')
		layout.addWidget(self.errorLabel)

		self.useRelativePathBox = QCheckBox('Save as Relative', self)
		self.useRelativePathBox.setMinimumHeight(20)
		self.useRelativePathBox.setChecked(not self.pathObject.isAbsolute())
		self.useRelativePathBox.toggled.connect(self.setPathRelative)
		layout.addWidget(self.useRelativePathBox)

		widget.setLayout(layout)
		return widget

	def setPathRelative(self, isRelative):
		self.pathObject.setAbsolute(not isRelative)
		if self.onAnyChange:
			self.onAnyChange(self.pathObject.getPathAbsoluteWithFile())
		if self.onPathChanged:
			self.onPathChanged(self.pathObject.getPathAbsoluteWithFile())

	def onClickedBrowse(self):
		path = self.textBox.text()
		if not self.isBrowsePathValid():
			path = str(Path.home())

		fileName = None
		if str(self.dialogFilter).startswith('d'):
			fileName = QFileDialog.getExistingDirectory(
				self, "Select TODO LABEL"
			)
		else:
			fileName, _ = QFileDialog.getOpenFileName(
				self, 'Select TODO LABEL', path
			)
		
		if not fileName or fileName == '':
			return
		
		self.textBox.setText(fileName)
		self.onBrowseChanged(fileName)

	def onBrowseChanged(self, path=None):
		self.pathObject.setAbsolutePath(path)

		if self.onAnyChange:
			self.onAnyChange(self.pathObject.getPathAbsoluteWithFile())

		valid = self.isBrowsePathValid()
		if valid:
			self.errorLabel.setText("")
			if self.onPathChanged:
				self.onPathChanged(self.pathObject.getPathAbsoluteWithFile())
		else:
			self.errorLabel.setText("Invalid path!")

	def isBrowsePathValid(self):
		return self.pathObject.isValid()

