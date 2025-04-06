# My Brand Backend

![GitHub package.json version](https://img.shields.io/github/package-json/v/hbapte/MyBrand-Backend)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger-brightgreen)](https://my-brand-oxuh.onrender.com/api-docs/)
[![Frontend Repo](https://img.shields.io/badge/Frontend-Repo-blue)](https://github.com/hbapte/MyBrand-Client)

Backend services for MyBrand project.

---

## Links

- [Live Demo Website](https://my-brand-client.vercel.app/)
- [Hosted Backend API](https://my-brand-oxuh.onrender.com/)
- [GitHub Repository (Backend)](https://github.com/hbapte/MyBrand-Backend)
- [GitHub Repository (Frontend)](https://github.com/hbapte/MyBrand-Client)

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

---

## Description

This repository contains the backend services for MyBrand, a project aimed at managing blogs, users, and their associated data. It provides RESTful APIs for communication with the frontend and handles authentication, database operations, and more.

---

## Features

- **Authentication**: Secure user authentication using JSON Web Tokens (JWT).
- **Data Management**: CRUD operations for blogs and users, powered by MongoDB with Mongoose.
- **File Uploads**: Multer middleware for handling file uploads.
- **Email Verification**: Verify user emails using Nodemailer.
- **API Documentation**: Swagger UI for easy API reference.

---
This repository contains the backend services for MyBrand, a project aimed at managing blogs, users, and their associated data. It provides RESTful APIs for communication with the frontend and handles authentication, database operations, and more.

---

## Features

- **Authentication**: Secure user authentication using JSON Web Tokens (JWT).
- **Data Management**: CRUD operations for blogs and users, powered by MongoDB with Mongoose.
- **File Uploads**: Multer middleware for handling file uploads.
- **Email Verification**: Verify user emails using Nodemailer.
- **API Documentation**: Swagger UI for easy API reference.

---

## Installation

To run the backend locally, follow these steps:

1. Clone this repository:

   ```bash
   git clone https://github.com/hbapte/MyBrand-Backend.git

2. Install dependencies:

     ```bash
     npm install

## Usage

1. To start the server in development mode, use:

     ```bash
     npm run dev

2. For production, build the project first and then start the server:

      ```bash
      npm run build
      npm start

## API Documentation

API documentation is available using Swagger UI. You can access it [https://my-brand-oxuh.onrender.com/api-docs/](https://my-brand-oxuh.onrender.com/api-docs/)

## Testing

1. To run tests, use:

     ```bash
     npm run test

2. To run test with coverage summary:
  
     ```bash
     npm run coverage

## API Endpoints

### API Servers

- **Localhost Server**: [http://localhost:5500/api](http://localhost:3000/api)
- **Cloud Server**: [https://my-brand-oxuh.onrender.com/api](https://my-brand-oxuh.onrender.com/api)

| NO | METHOD | ENDPOINT          | STATUS | ACCESS     | DESCRIPTION                            |
|----|--------|-------------------|--------|------------|----------------------------------------|
| 1  | GET    | /                 | 200    | Public     | Welcome to the API                     |
| 2  | POST   | /auth/register    | 201    | Public     | Register a new user                    |
| 3  | POST   | /auth/login       | 201    | Public     | User login                             |
| 4  | POST   | /blogs            | 201    | Auth Token | Add a new blog                         |
| 5  | GET    | /blogs            | 200    | Public     | Get all blogs                          |
| 6  | GET    | /blogs/{id}       | 200    | Public     | Get a blog by ID                       |
| 7  | PUT    | /blogs/{id}       | 200    | Auth Token | Update a blog by ID                    |
| 8  | DELETE | /blogs/{id}       | 200    | Auth Token | Delete a blog by ID                    |
| 9  | POST   | /contact          | 200    | Public     | Add a new message                      |
| 10 | GET    | /contact          | 200    | Public     | Get all messages                       |
| 11 | DELETE | /contact/{id}     | 200    | Auth Token | Delete a message by ID                 |

## License

This project is licensed under the [MIT License](/LICENCE).
