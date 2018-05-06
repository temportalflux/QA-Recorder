import os
import json
import asyncio
import logging
import sys
import argparse
import subprocess
import obswsrc

from taskManager import TaskManager
from obs import OBS
import obsControl
from applicationController import ApplicationController

#def moveToHome():
#	home = os.path.dirname(os.path.realpath(__file__))
#	os.chdir(home)
#	return home

def loadJson(filePath):
	data = {}
	with open(filePath) as file:
		data = json.loads(file.read())
	return data

class TODORenameMain:

	def __init__(self):
		self.logger = logging.getLogger('')
		self.dirHome = os.getcwd()
		self.config = loadJson("config.json")
		self.taskManager = TaskManager(self.logger)

		self.obs = OBS(self.logger, self.config["obs"]["executable"])
		self.targetApplication = self.createTargetApplication()

	def run(self):
		self.taskManager.runUntilComplete(self.runAndWait())
		self.taskManager.destroy()

	async def runAndWait(self):
		self.logger.info("Running...")

		await self.obs.open(False)

		async with obswsrc.OBSWS('localhost', 4444, "password") as obsws:
			
			controller = obsControl.OBSControl(self.logger, obsws)

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

logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)7s: %(message)s',
    stream=sys.stderr,
)
main = TODORenameMain()
main.run()
input("Press Enter to continue...")
