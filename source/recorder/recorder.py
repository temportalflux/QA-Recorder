import os
import json
import asyncio
import logging
import sys
import argparse
import subprocess
import obswsrc

from recorder.taskManager import TaskManager
from recorder.obsControl import OBSControl
from recorder.applicationController import ApplicationController

#def moveToHome():
#	home = os.path.dirname(os.path.realpath(__file__))
#	os.chdir(home)
#	return home

def loadJson(filePath):
	data = {}
	with open(filePath) as file:
		data = json.loads(file.read())
	return data

class Recorder:

	def __init__(self):
		self.logger = logging.getLogger('')
		self.dirHome = os.getcwd()
		self.config = loadJson("config.json")
		self.taskManager = TaskManager(self.logger)

		self.obs = ApplicationController(self.logger, 'OBS Studio', self.config["obs"]["executable"])
		self.targetApplication = self.createTargetApplication()

	def run(self):
		self.taskManager.runUntilComplete(self.runAndWait())
		self.taskManager.destroy()

	async def runAndWait(self):
		self.logger.info("Running...")

		await self.obs.open(False)

		async with obswsrc.OBSWS('localhost', 4444, "password") as obsws:
			
			controller = OBSControl(self.logger, obsws)

			await controller.setup(self.config["obs"]["settings"])

			await self.targetApplication.open(True)

			# try to start recording, settings permitting
			await controller.tryToggleRecording(start=True)

			# try to start streaming, settings permitting
			await controller.tryToggleStreaming(start=True)

			await self.targetApplication.waitUntilClosed()

			# try to start streaming, settings permitting
			await controller.tryToggleStreaming(start=False)

			# try to stop recording, settings permitting
			await controller.tryToggleRecording(start=False)

		self.obs.close()

	def createTargetApplication(self):
		targetAppSettings = self.config['target']
		return ApplicationController(self.logger, targetAppSettings['name'], targetAppSettings)

def runRecorder():
	logging.basicConfig(
		level=logging.INFO,
		format='%(levelname)7s: %(message)s',
		stream=sys.stderr,
	)
	Recorder().run()
	input("Press Enter to continue...")
