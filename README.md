# ColiCount
ColiCount is a web application designed for microbial colony analysis. It streamlines laboratory data processing with automated and manual data entry, interactive visualizations, and export capabilities.

## Features
Automated colony counting using computer vision.
Interactive data visualization dashboard.
CSV export for data portability.
MySQL database for efficient data storage and retrieval.

## Prerequisites
Node.js
npm
MySQL 

## Set Up
Create a .env file in the root of your project. Use the example below as a template:

`DB_HOST=localhost`

`DB_USER=root`

`DB_PASSWORD=your_password`

`DB_NAME=colicount_db`

`PORT=your_db_port`

`SERVER_PORT=your_server_port`

'SECRET_KEY=your_secret_key'

## Create Table
Execute sql in plates-table.sql

## Run Program
use the command `make` in the parent directory

## OpenCV Integration is still a WIP
Can test what we do have working with the images that are provided in the images folder just to get an idea of where we are going with it.
