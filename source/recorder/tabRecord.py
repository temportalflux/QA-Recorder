
from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

from recorder.recorder import Recorder
from util.browseBar import Browse
from util.struct import Struct
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
		layout.addWidget(self.initObs())

		widget.setLayout(layout)

	def initBrowseTarget(self):
		widget = QGroupBox('Target')
		layout = QVBoxLayout()

		# target game name
		layout.addWidget(self.initLabelledTextBox(
			widget, "Name",
			self.activeConfig.getActiveConfigAtPath(['target', 'name']),
			self.onChangedTargetName
		))

		# Executable:
		# 64 and 32-bit
		layout.addWidget(self.initBoxExecutable('Executable', ['target']))

		widget.setLayout(layout)
		return widget

	def initObs(self):
		widget = QGroupBox('OBS')
		layout = QVBoxLayout()

		# obs Executable:
		# 64 and 32-bit
		layout.addWidget(self.initBoxExecutable('Executable', ['obs', 'executable']))

		# ~~~ Settings ~~~

		widget_settings = QGroupBox('Settings')
		layout_settings = QVBoxLayout()

		# profile
		browseProfile = Browse("Profile",
			self.activeConfig.getActiveConfigAtPath(['obs', 'settings', 'profile']),
			"dir", self.onProfilePathChanged, self.onProfilePathChanged)
		layout_settings.addWidget(browseProfile)

		# scene collection
		browseSceneCollection = Browse("Scene Collection",
			self.activeConfig.getActiveConfigAtPath(['obs', 'settings', 'scene-collection']),
			"*.json", self.onSceneCollectionPathChanged, self.onSceneCollectionPathChanged)
		layout_settings.addWidget(browseSceneCollection)
		
		# scene
		layout_settings.addWidget(self.initLabelledTextBox(
			widget_settings, "Scene Name",
			self.activeConfig.getActiveConfigAtPath(['obs', 'settings', 'scene']),
			self.onSceneNameChanged
		))

		widget_settings.setLayout(layout_settings)
		layout.addWidget(widget_settings)

		# ~~~ Recording ~~~

		widget_recording = QGroupBox('Recording')
		layout_recording = QVBoxLayout()

		# recording toggle
		shouldRecord = QCheckBox('Record', widget_recording)
		shouldRecord.setChecked(self.activeConfig.getActiveConfigAtPath(['obs', 'recording', 'active']))
		shouldRecord.toggled.connect(self.onChangedShouldRecord)
		layout_recording.addWidget(shouldRecord)
		
		# output path
		outputPath = Browse("Output Path",
			self.activeConfig.getActiveConfigAtPath(['obs', 'recording', 'output-path']),
			"dir", self.onChangedOutputPath, self.onChangedOutputPath)
		layout_recording.addWidget(outputPath)

		layout_recording.addWidget(self.initLabelledTextBox(
			widget_recording, "Output name",
			self.activeConfig.getActiveConfigAtPath(['obs', 'recording', 'output-name']),
			self.onChangedRecordingName
		))

		widget_recording.setLayout(layout_recording)
		layout.addWidget(widget_recording)

		# ~~~ Streaming ~~~

		widget_streaming = QGroupBox('Streaming')
		layout_streaming = QVBoxLayout()
		
		# streaming toggle
		shouldStream = QCheckBox('Stream', widget_streaming)
		shouldStream.setChecked(self.activeConfig.getActiveConfigAtPath(['obs', 'streaming', 'active']))
		shouldStream.toggled.connect(self.onChangedShouldStream)
		layout_streaming.addWidget(shouldStream)

		# stream server
		layout_streaming.addWidget(self.initLabelledTextBox(
			widget_streaming, "Server",
			self.activeConfig.getActiveConfigAtPath(['obs', 'streaming', 'server']),
			self.onChangedServerName
		))

		# stream key
		layout_streaming.addWidget(self.initLabelledTextBox(
			widget_streaming, "Stream Key",
			self.activeConfig.getActiveConfigAtPath(['obs', 'streaming', 'key']),
			self.onChangedStreamKey
		))

		# stream auth toggle
		useAuth = QCheckBox('Use Authentication', widget_streaming)
		useAuth.setChecked(self.activeConfig.getActiveConfigAtPath(['obs', 'streaming', 'authentiation', 'enabled']))
		useAuth.toggled.connect(self.onChangedStreamUseAuthentication)
		layout_streaming.addWidget(useAuth)

		# stream auth username
		layout_streaming.addWidget(self.initLabelledTextBox(
			widget_streaming, "Username",
			self.activeConfig.getActiveConfigAtPath(['obs', 'streaming', 'authentiation', 'username']),
			self.onChangedStreamUsername
		))

		# stream auth password
		layout_streaming.addWidget(self.initLabelledTextBox(
			widget_streaming, "Password",
			self.activeConfig.getActiveConfigAtPath(['obs', 'streaming', 'authentiation', 'password']),
			self.onChangedStreamPassword
		))

		widget_streaming.setLayout(layout_streaming)
		layout.addWidget(widget_streaming)

		widget.setLayout(layout)
		return widget

	def initLabelledTextBox(self, parent, label, defaultValue, onChanged):
		widget = QWidget(parent)
		layout = QHBoxLayout()

		layout.addWidget(QLabel(label))

		textBox = QLineEdit(widget)
		textBox.setText(defaultValue)
		textBox.textChanged.connect(onChanged)
		layout.addWidget(textBox)

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

	def onChangedTargetName(self, text):
		self.activeConfig.data['target']['name'] = text
		self.checkForChangesInConfig()

	def onPathValueChanged(self, path):
		self.checkForChangesInConfig()

	def onProfilePathChanged(self, path):
		self.checkForChangesInConfig()

	def onSceneCollectionPathChanged(self, path):
		self.checkForChangesInConfig()

	def onSceneNameChanged(self, text):
		self.activeConfig.data['obs']['settings']['scene'] = text
		self.checkForChangesInConfig()

	def onChangedShouldRecord(self, shouldRecord):
		self.activeConfig.data['obs']['recording']['active'] = shouldRecord
		self.checkForChangesInConfig()

	def onChangedOutputPath(self, path):
		self.checkForChangesInConfig()

	def onChangedRecordingName(self, text):
		self.activeConfig.data['obs']['recording']['output-name'] = text
		self.checkForChangesInConfig()

	def onChangedShouldStream(self, shouldStream):
		self.activeConfig.data['obs']['streaming']['active'] = shouldStream
		self.checkForChangesInConfig()

	def onChangedServerName(self, text):
		self.activeConfig.data['obs']['streaming']['server'] = text
		self.checkForChangesInConfig()

	def onChangedStreamKey(self, text):
		self.activeConfig.data['obs']['streaming']['key'] = text
		self.checkForChangesInConfig()

	def onChangedStreamUseAuthentication(self, use):
		self.activeConfig.data['obs']['streaming']['authentiation']['enabled'] = use
		self.checkForChangesInConfig()

	def onChangedStreamUsername(self, text):
		self.activeConfig.data['obs']['streaming']['authentiation']['username'] = text
		self.checkForChangesInConfig()

	def onChangedStreamPassword(self, text):
		self.activeConfig.data['obs']['streaming']['authentiation']['password'] = text
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

	def onTabActivated(self):
		pass

	def onExecComplete(self):
		self.recorder.destroy()
