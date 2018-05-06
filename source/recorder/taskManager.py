import asyncio
import sys

class TaskManager:

	def __init__(self, logger):
		if sys.platform == 'win32':
			loop = asyncio.ProactorEventLoop()
			asyncio.set_event_loop(loop)
		self.event_loop = asyncio.get_event_loop()

	def runUntilComplete(self, waitedTask):
		self.event_loop.run_until_complete(waitedTask)

	def destroy(self):
		self.event_loop.close()
