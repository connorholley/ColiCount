# Makefile for running a front-end and back-end

# Define commands and file paths
FRONTEND_CMD=http-server
BACKEND_CMD=node server.js

# The default target is 'start'.
start: start-backend start-frontend

# Start the back-end server first, in the background
start-backend:
	@echo "Starting back-end..."
	$(BACKEND_CMD) &

# Start the front-end server
start-frontend:
	@echo "Starting front-end..."
	$(FRONTEND_CMD)

# Stop the servers
stop:
	@echo "Stopping servers..."
	# Stop the front-end server (http-server)
	@pkill -f 'http-server'
	# Stop the back-end server (node server.js)
	@pkill -f 'node server.js'

# Clean the build or node_modules if you want
clean:
	@echo "Cleaning up..."
	rm -rf node_modules
	rm -rf dist  # if you have a 'dist' folder for your front-end build

# Open the app in the browser (optional, only if you want this task)
open:
	@echo "Opening app in browser..."
	open http://localhost:8080 # Change port if needed
