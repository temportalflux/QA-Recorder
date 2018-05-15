
from pathlib import Path

from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

from util.browseBar import Browse

class DialogClone(QDialog):

	def __init__(self, resources, committer):
		super(DialogClone, self).__init__()
		self.committer = committer
		self.initWindow(resources)

	def exec_(self):
		super(DialogClone, self).exec_()
		return None

	def initWindow(self, resources):
		self.setWindowIcon(resources.getQIcon('clone'))
		self.setWindowTitle('QA Viewer: Clone Repository')
		
		w, h = self.initContent(resources)

		self.resize(w, h)

	def initContent(self, resources):
		layout = QVBoxLayout(self)

		layout.addWidget(self.initForm())
		layout.addWidget(self.initSubmissionButtons())

		self.onChangedRemote()
		self.onChangedLocal()

		return 600, 400

	def initForm(self):
		widget = QGroupBox(None)
		self.formLayout = QFormLayout(widget)

		# TODO: Make defaults come from config settings (so users dont have to manually set each build)
		self.fieldClone = self.initTextField(widget, "Repository Source URL",
			"https://username:password@github.com/user/repository/")
		self.fieldBranch = self.initTextField(widget, "Branch", "recordings")

		self.checkRemote = self.initButton(widget, "Check", self.onChangedRemote)

		self.infoRemote = self.initLabel(widget, 'Remote Validation', 'Invalid')

		self.browseDest = self.initBrowse(widget, "Destination")
		self.browseDestName = self.initTextField(widget, "New folder name",
			"repo_folder_destination")

		self.infoLocal = self.initLabel(widget, 'Local Validation', 'Valid')

		self.checkLocal = self.initButton(widget, "Check", self.onChangedLocal)

		widget.setLayout(self.formLayout)
		return widget

	def initSubmissionButtons(self):
		self.buttonBox = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
		self.buttonBox.accepted.connect(self.clone)
		self.buttonBox.rejected.connect(self.reject)
		return self.buttonBox

	def initWidget(self, label, widget):
		qlabel = None
		if label:
			qlabel = QLabel(label)
		self.formLayout.addRow(qlabel, widget)
		return widget

	def initTextField(self, parent, label, defaultText=None, onChanged=None):
		field = QLineEdit(parent)
		field.setText(defaultText)
		if onChanged:
			field.textChanged.connect(onChanged)
		return self.initWidget(label, field)

	def initBrowse(self, parent, label, onPathChanged=None, onAnyChange=None):
		return self.initWidget(label,
			Browse(None, str(Path.home()), "dir", onPathChanged, onAnyChange)
		)

	def initLabel(self, parent, label, defaultText):
		return self.initWidget(label, QLabel(defaultText))

	def initButton(self, parent, label, onClicked):
		widget = QPushButton(label)
		widget.clicked.connect(onClicked)
		return self.initWidget(None, widget)

	def markInfo(self, label, isValid, messageValid, messageInvalid):
		color = 'green'
		message = messageValid
		if not isValid:
			color = 'red'
			message = messageInvalid
		label.setStyleSheet('color: {};'.format(color))
		label.setText(message)

	def doesRemoteExist(self):
		result = self.committer.run_command_shell_response(
			'git ls-remote --heads {} | wc -l'.format(
				self.fieldClone.text()
			)
		)
		return len(result) > 0 and int(result) > 0

	def doesBranchExist(self):
		result = self.committer.run_command_shell_response(
			'git ls-remote --heads {} {} | wc -l'.format(
				self.fieldClone.text(), self.fieldBranch.text()
			)
		)
		return len(result) > 0 and int(result) > 0

	def onChangedRemote(self):
		self.validRemote = False

		repoExists = self.doesRemoteExist()

		self.markInfo(self.infoRemote,
			repoExists,
			'Repository Exists',
			'Repository does not exist'
		)
		if repoExists:
			branchExists = self.doesBranchExist()
			self.markInfo(self.infoRemote,
				branchExists,
				'Repository and Branch Exist',
				'Branch does not exist'
			)

			self.validRemote = branchExists
			self.updateConfirmationButton()

			return branchExists

		return False

	def onChangedLocal(self):
		self.validLocal = False
		
		destParentExists = self.getDestPathParent().exists()

		self.markInfo(self.infoLocal,
			destParentExists,
			'Destination containing folder exists',
			'Destination folder path does not exist'
		)

		#if destParentExists:
		#	destPath = self.getDestPath()
		#	destExists = destPath.exists()
		#	# may cause temporary lag in program as it search subdirs
		#	if destExists:
		#		self.committer.logger.info(destPath.rglob('*'))
		#		destExists = 0 > 0
		#	self.markInfo(self.infoLocal,
		#		not destExists,
		#		'Desstination valid (dne or empty)',
		#		'Destination folder is non-empty'
		#	)
		
		self.validLocal = destParentExists
		self.updateConfirmationButton()

		return destParentExists

	def updateConfirmationButton(self):
		self.buttonBox.button(QDialogButtonBox.Ok).setEnabled(self.validRemote and self.validLocal)

	def getDestPathParent(self):
		return self.browseDest.getLibPath()

	def getDestPath(self):
		return self.getDestPathParent().joinpath(self.browseDestName.text())

	def clone(self):
		source = self.fieldClone.text()
		branch = self.fieldBranch.text()
		dest = self.getDestPath()

		#self.committer.logger.info('{} -> {}'.format(source, dest))
		self.committer.clonePull(source, branch, str(dest))
		
		self.accept()

