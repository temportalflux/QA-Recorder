
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

from recorder.recorder import Recorder
from lib.browseBar import Browse
from lib.struct import Struct
import logging

class TabLaunch(QWidget):

	def __init__(self, parent=None, recorder=None):
		super(TabLaunch, self).__init__(parent)
		self.tabLabel = "Launch"
		self.recorder = recorder
		self.initContent()

	def initContent(self):
		layout = QVBoxLayout()

		btnLaunch = QPushButton("Launch")
		btnLaunch.clicked.connect(self.launch)
		layout.addWidget(btnLaunch)

		self.setLayout(layout)

	def launch(self):
		self.recorder.runUntilComplete()

class TabSettings(QWidget):

	def __init__(self, parent=None, activeConfig=None, savedConfig=None):
		super(TabSettings, self).__init__(parent)
		self.tabLabel = "Settings"
		self.activeConfig = activeConfig
		self.savedConfig = savedConfig
		self.initScroll()

	def initScroll(self):
		layout = QVBoxLayout()

		scroll = QScrollArea(self)
		scrollWidget = QWidget(scroll)
		self.initContent(scrollWidget)

		scroll.setWidget(scrollWidget)

		scroll.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOn)
		scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
		scroll.setWidgetResizable(True)

		layout.addWidget(scroll)

		self.btnSaveChanges = QPushButton("Save Changes")
		self.btnSaveChanges.setEnabled(False)
		self.btnSaveChanges.clicked.connect(self.saveChanges)
		layout.addWidget(self.btnSaveChanges)

		self.setLayout(layout)

	def initContent(self, widget):
		layout = QVBoxLayout()

		layout.addWidget(self.initBrowseTarget())
		layout.addWidget(self.initObsSettings())

		widget.setLayout(layout)

	def initBrowseTarget(self):
		return self.initBoxExecutable('Target Exec', ['target'])

	def initObsSettings(self):
		widget = QGroupBox('OBS')
		layout = QVBoxLayout()

		# obs Executable:
		# 64 and 32-bit
		layout.addWidget(self.initBoxExecutable('Executable', ['obs', 'executable']))

		# profile
		browseProfile = Browse("Profile",
			self.activeConfig.getActiveConfigAtPath(['obs', 'settings', 'profile']),
			"dir", self.onProfilePathChanged, self.onProfilePathChanged)
		layout.addWidget(browseProfile)

		# scene collection
		# scene

		# recording toggle
		# output path
		
		# streaming toggle
		# stream server
		# stream key
		# stream auth toggle
		# stream auth username
		# stream auth password

		# target game name
		# Executable:
		# 64 and 32-bit

		widget.setLayout(layout)
		return widget

	def initBoxExecutable(self, label, pathToObj):
		widget = QGroupBox(label)
		layout = QVBoxLayout()

		self.target = Struct()
		self.target.browse32 = Browse("32-bit",
			self.activeConfig.getActiveConfigAtPath(pathToObj)['32'],
			"*.exe", self.onPathValueChanged, self.onPathValueChanged)
		self.target.browse64 = Browse("64-bit",
			self.activeConfig.getActiveConfigAtPath(pathToObj)['64'],
			"*.exe", self.onPathValueChanged, self.onPathValueChanged)
		
		layout.addWidget(self.target.browse32)
		layout.addWidget(self.target.browse64)

		widget.setLayout(layout)
		return widget

	def onPathValueChanged(self, path):
		self.checkForChangesInConfig()

	def onProfilePathChanged(self, path):
		self.checkForChangesInConfig()

	def checkForChangesInConfig(self):
		self.btnSaveChanges.setEnabled(self.activeConfig.hasChanges(self.savedConfig))

	def saveChanges(self):
		self.activeConfig.save()
		self.savedConfig.reload()
		self.checkForChangesInConfig()

class Tab(QTabWidget):

	def __init__(self, parent=None):
		super(Tab, self).__init__(parent)
		
		self.tabLabel = "Record"
		
		self.activeConfig = parent.activeConfig
		self.savedConfig = parent.savedConfig
		self.recorder = Recorder(parent.activeConfig)

		self.initContent()

	def initContent(self):
		
		launch = TabLaunch(self, self.recorder)
		self.addTab(launch, launch.tabLabel)
		
		settings = TabSettings(self, self.activeConfig, self.savedConfig)
		self.addTab(settings, settings.tabLabel)

	def onExecComplete(self):
		self.recorder.destroy()
