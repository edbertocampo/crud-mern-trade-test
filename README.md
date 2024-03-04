# CRUD Website with User Authentication

A CRUD (Create, Read, Update, Delete) website that incorporates user login functionality using React. Users can register, log in, and view user information securely.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [User Registration](#user-registration)
- [User Login](#user-login)
- [View & Update User Information](#view-&-update-user-information)
- [Forgot Password & Reset Password](#forgot-password-&-reset-password)
- [Delete Account](#delete-account)
- [Video Demonstration](#video-demonstration)

## Overview

Create a CRUD (Create, Read, Update, Delete) website that incorporates user login functionality using React.

## Features

- User registration and login
- View and update user information
- Secure authentication for user access
- CRUD functionality for managing user data

## Requirements

To run this project, ensure you have the following:

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) for database storage
- [React](https://reactjs.org/) for the frontend

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS
- **API Requests**: Axios

## Setup and Installation

1. Clone this repository: `git clone https://github.com/your-username/your-repo.git`
2. Install dependencies: `npm install`
3. Configure MongoDB: Update connection details in the `server.js` file.
4. Start the server: `cd backend && node server.js`
5. Start the React app: `cd client && npm start`

## User Registration

1. Navigate to the registration page.
2. Fill out the registration form with your details.
3. Click the "Register" button.
4. Upon successful login, you will be redirected to the login page.

![](https://github.com/edbertocampo/crud-mern-trade-test/blob/master/register.gif)

## User Login

1. Go to the login page.
2. Enter your registered email and password.
3. Click the "Login" button.
4. Upon successful login, you will be redirected to the user profile.

![](https://github.com/edbertocampo/crud-mern-trade-test/blob/master/login.gif)

## View & Update User Information

1. After login, you'll land on the user dashboard.
2. View your profile information, including username, email, and other details.
3. Find the "Edit Profile" section on the user dashboard.
4. Modify the desired fields.
5. Click the "Save Changes" button.
6. You will receive a success message upon successful update.

![](https://github.com/edbertocampo/crud-mern-trade-test/blob/master/view%26update.gif)

## Forgot Password & Reset Password

1. On the login page you will a link for forgot password.
2. Put your email address and wait until the link for reset password shows up.
3. Input your new password and click the "Reset Password" button
4. Upon successfully resetting the password, you will be redirected to the login page.

![](https://github.com/edbertocampo/crud-mern-trade-test/blob/master/reset.gif)

## Delete Account

1. On the profile page there is a link for Delete Account.
2. Click the "Delete Account" button if you want to delete your user account (Note: This is irreversible)

## Video Demonstration
[![Watch the Video]](https://drive.google.com/file/d/1rBkbUcGf4KOm-VuxmV75155uRyD51Z_k/view?usp=sharing)





