
import os

import asyncio
import subprocess

import random
from time import sleep

class ProgramInstaller:

	async def install(self, directory, installers):
		tasks = [asyncio.ensure_future(self.installProgram(directory, program, paths)) for program, paths in installers.items()]
		await asyncio.wait(tasks)

	async def installProgram(self, directory, program, paths):
		print("Found dependency {}".format(program))
			
		installer = paths["installer"]
		destination = paths["destination"]

		installer = os.path.join(directory, installer).replace("/","\\")
		destination = os.path.join(directory, destination).replace("/","\\")

		await self.installProgramAt(program, installer, destination)

	async def installProgramAt(self, program, installer, destination):
		print("Installing {} using {} at {}".format(program, installer, destination))
		
		#await asyncio.sleep(random.randint(0, 2) * 0.001)
		await self.run_command(
			# https://stackoverflow.com/questions/47380378/run-process-as-admin-with-subprocess-run-in-python
			#'runas', '/noprofile', '/user:Administrator',
			#'NeedsAdminPrivilege.exe'
			installer
		)

		print("Done installing {}".format(program))

	async def run_command(self, *args):
		"""Run command in subprocess

		Example from:
			https://fredrikaverpil.github.io/2017/06/20/async-and-await-with-subprocesses/
			http://asyncio.readthedocs.io/en/latest/subprocess.html
		"""

		# Create subprocess
		process = await asyncio.create_subprocess_exec(
			*args,
			# stdout must a pipe to be accessible as process.stdout
			stdout=asyncio.subprocess.PIPE)

		# Status
		print('Started:', args, '(pid = ' + str(process.pid) + ')')

		# Wait for the subprocess to finish
		stdout, stderr = await process.communicate()

		# Progress
		if process.returncode == 0:
			print('Done:', args, '(pid = ' + str(process.pid) + ')')
		else:
			print('Failed:', args, '(pid = ' + str(process.pid) + ')')

		# Result
		result = stdout.decode().strip()

		# Return stdout
		return result
