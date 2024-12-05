# ColiCount
ColiCount is a web application designed for microbial colony analysis. It streamlines laboratory data processing with automated and manual data entry, interactive visualizations, and export capabilities.

## Features
Automated colony counting using computer vision.
Interactive data visualization dashboard.
CSV export for data portability.
MySQL database for efficient data storage and retrieval.

## Getting Started
Follow these steps to set up and run the project locally.

## Prerequisites
Node.js: Install the latest version from Node.js downloads.
npm: Comes bundled with Node.js.
MySQL: Ensure you have MySQL installed and running. You can download it here.

## Set Up
Create a .env file in the root of your project. Use the example below as a template:

`DB_HOST=localhost`

`DB_USER=root`

`DB_PASSWORD=your_password`

`DB_NAME=colicount_db`

`PORT=3000`

`SERVER_PORT=3001`

## Create Table
Execute sql in plates-table.sql

## Run Program
use the command `make` in the parent directory
