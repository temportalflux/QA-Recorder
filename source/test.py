
import asyncio
import random
import datetime
from taskManager import TaskManager
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)7s: %(message)s',
    stream=sys.stderr,
)
logger = logging.getLogger('')

async def run_command_shell(*args):
	"""Run command in subprocess

	Example from:
		https://fredrikaverpil.github.io/2017/06/20/async-and-await-with-subprocesses/
		http://asyncio.readthedocs.io/en/latest/subprocess.html
	"""

	# Create subprocess
	process = await asyncio.create_subprocess_shell(
		*args,
		# stdout must a pipe to be accessible as process.stdout
		stdout=asyncio.subprocess.PIPE)

	# Status
	logger.info('Started: {} (pid = {})'.format(args, process.pid))

	# Wait for the subprocess to finish
	stdout, stderr = await process.communicate()

	# Progress
	if process.returncode == 0:
		logger.info('Done: {} (pid = {})'.format(args, process.pid))
	else:
		logger.info('Failed: {} (pid = {})'.format(args, process.pid))

	# Result
	result = stdout.decode().strip()

	# Return stdout
	return result

async def writeData():
	return await run_command_shell('echo "temporary data" > "{}.txt"'.format(datetime.datetime.now().strftime("%m-%d-%Y-%H-%M-%S")))

tasker = TaskManager(logger)
tasker.runUntilComplete(writeData())
tasker.destroy()

input("Press Enter to continue...")