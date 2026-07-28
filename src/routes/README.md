# Nishpadya API Routes & Frontend Integration Guide

This guide explains the routing system of **Nishpadya**, a task management backend. It outlines the HTTP endpoints available, their expected request payloads, response formats, and how they should be called from a frontend application (using `fetch` or `axios`).

---

## Table of Contents
1. [General Architecture](#1-general-architecture)
2. [Authentication Middleware](#2-authentication-middleware)
3. [User Routes (`/api/v1/users`)](#3-user-routes)
4. [Task Routes (`/api/v1/task`)](#4-task-routes)
5. [Critical Backend Bugs & Fixes](#5-critical-backend-bugs--fixes)
6. [Frontend Integration Examples](#6-frontend-integration-examples)

---

## 1. General Architecture

The backend uses **Express** for routing, **MongoDB (Mongoose)** for the database, and **JWT** for user session management.
* **Server Port**: Configured via the `.env` file (usually `PORT`).
* **Base URL**: `http://localhost:<PORT>`
* **Route Prefixes**:
  * User-related actions: `/api/v1/users`
  * Task-related actions: `/api/v1/task`

All standard JSON responses from the server are formatted using a custom `ApiResponce` wrapper class:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success message description",
  "data": { ... } // Response payload
}
```

Standard error responses are formatted using `ApiError`:
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error details",
  "errors": []
}
```

---

## 2. Authentication Middleware

Protected endpoints require a valid JSON Web Token (JWT). The backend checks for the presence of the `accessToken` in:
1. **Cookies**: `accessToken` cookie.
2. **Headers**: `Authorization: Bearer <accessToken>`.

If the token is valid, it attaches the authenticated user object to `req.user` and proceeds. Otherwise, it throws a `401 Unauthorized` error.

---

## 3. User Routes

**Prefix:** `/api/v1/users`

| Endpoint | Method | Authentication | Payload Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/register` | `POST` | None | `multipart/form-data` | Register a new user with an avatar image. |
| `/login` | `POST` | None | `application/json` | Log in a user and set cookies. |
| `/logout` | `POST` | JWT Required | None | Log out a user and clear authentication cookies. |
| `/refreshAccessToken` | `POST` | None | `application/json` or Cookie | Refreshes the JWT access token. |
| `/updatePassword` | `POST` | JWT Required | `application/json` | Update the current user's password. |
| `/getCurrentUser` | `POST` | JWT Required | None | Fetch details of the currently logged-in user. |
| `/updateAccountDetails` | `POST` | JWT Required | `multipart/form-data` | Update fullname, email, and/or avatar. |
| `/deleteUser` | `POST` | JWT Required | None | Delete user account and their Cloudinary avatar. |

### Endpoint Details

#### Register User
* **URL:** `/api/v1/users/register`
* **Content-Type:** `multipart/form-data`
* **Request Fields:**
  * `email` (string, required)
  * `password` (string, required)
  * `name` (string, required)
  * `avatar` (file, optional, max 1 file)
* **Response (201 Created):**
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "65d1ab23e5902b4a1c...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "http://res.cloudinary.com/...jpg",
      "createdAt": "2026-07-28T...",
      "updatedAt": "2026-07-28T..."
    }
  }
  ```

#### Login User
* **URL:** `/api/v1/users/login`
* **Content-Type:** `application/json`
* **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK):**
  * Sets secure, httpOnly cookies: `accessToken` and `refreshToken`.
  * *Note: See the [Bugs Section](#5-critical-backend-bugs--fixes) regarding the mismatched keys in this response.*

#### Logout User
* **URL:** `/api/v1/users/logout`
* **Response (200 OK):**
  * Clears `accessToken` and `refreshToken` cookies.
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "User logged out successfully",
    "data": {}
  }
  ```

#### Refresh Access Token
* **URL:** `/api/v1/users/refreshAccessToken`
* **Content-Type:** `application/json` (if token is not sent as cookie)
* **Body:**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```
* **Response (200 OK):**
  * Re-sets secure, httpOnly cookies for `accessToken` and `refreshToken`.
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

#### Update Password
* **URL:** `/api/v1/users/updatePassword`
* **Content-Type:** `application/json`
* **Body:**
  ```json
  {
    "oldPassword": "securepassword123",
    "newPassword": "newsupersecurepassword"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Password changed successfully",
    "data": {}
  }
  ```

#### Get Current User
* **URL:** `/api/v1/users/getCurrentUser`
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "User fetched successfully",
    "data": {
      "_id": "65d1...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "..."
    }
  }
  ```

#### Update Account Details
* **URL:** `/api/v1/users/updateAccountDetails`
* **Content-Type:** `multipart/form-data`
* **Request Fields:**
  * `fullname` (string, required)
  * `email` (string, required)
  * `avatar` (file, optional, max 1 file)
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Account details updated successfully",
    "data": {
      "_id": "65d1...",
      "name": "John Doe",
      "email": "updated@example.com",
      "avatar": "new_url"
    }
  }
  ```

#### Delete User
* **URL:** `/api/v1/users/deleteUser`
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "User deleted successfully",
    "data": { ... } // Deleted user object
  }
  ```

---

## 4. Task Routes

**Prefix:** `/api/v1/task`

| Endpoint | Method | Authentication | Payload Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/createTask` | `POST` | JWT Required | `application/json` | Create a new task. |
| `/updateTask` | `POST` | JWT Required | `application/json` | Update an existing task. *(Requires fix, see bugs)* |
| `/deleteTask` | `POST` | JWT Required | None | Delete a task by ID. *(Requires fix, see bugs)* |
| `/getTask` | `POST` | JWT Required | None | Fetch all tasks owned by the current user. |
| `/getTaskById` | `POST` | JWT Required | None | Fetch a single task by ID. *(Requires fix, see bugs)* |
| `/assist` | `POST` | JWT Required | `application/json` | Fetch general AI response (Grok). |
| `/assist/:taskId` | `POST` | JWT Required | None | Fetch AI assistance contextually for a task. |

### Endpoint Details

#### Create Task
* **URL:** `/api/v1/task/createTask`
* **Content-Type:** `application/json`
* **Body:**
  ```json
  {
    "title": "Build UI Dashboard",
    "description": "Design and implement the main analytics dashboard widget.",
    "status": "pending", // optional, defaults to "pending" (values: "pending" | "completed")
    "priority": "medium", // optional, defaults to "medium" (values: "high" | "medium" | "low")
    "dueDate": "2026-08-15T00:00:00.000Z" // required
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "Task created successfully",
    "data": {
      "_id": "65d21a...",
      "title": "Build UI Dashboard",
      "description": "...",
      "status": "pending",
      "priority": "medium",
      "dueDate": "2026-08-15T00:00:00.000Z",
      "owner": "65d1ab23e5902b4a1c...",
      "createdAt": "2026-07-28T...",
      "updatedAt": "2026-07-28T..."
    }
  }
  ```

#### Update Task
* **URL:** `/api/v1/task/updateTask` *(Note: Route requires fixing to support params)*
* **Content-Type:** `application/json`
* **Body:**
  ```json
  {
    "title": "Updated Title",
    "description": "Updated Description",
    "status": "completed",
    "dueDate": "2026-08-20T00:00:00.000Z",
    "priority": "high"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Task updated successfully",
    "data": { ... } // Updated task object
  }
  ```

#### Delete Task
* **URL:** `/api/v1/task/deleteTask` *(Note: Route requires fixing to support params)*
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Success",
    "data": "Task deleted successfully"
  }
  ```

#### Get Tasks (All)
* **URL:** `/api/v1/task/getTask`
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Tasks fetched successfully",
    "data": [
      {
        "_id": "65d21a...",
        "title": "Build UI Dashboard",
        "description": "...",
        "status": "pending",
        "priority": "medium",
        "dueDate": "2026-08-15T..."
      }
    ]
  }
  ```

#### Get Task By ID
* **URL:** `/api/v1/task/getTaskById` *(Note: Route requires fixing to support params)*
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Task fetched successfully",
    "data": { ... } // Task object
  }
  ```

#### General AI Assist (Grok)
* **URL:** `/api/v1/task/assist`
* **Content-Type:** `application/json`
* **Body:**
  ```json
  {
    "message": "Help me plan a software testing strategy."
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Response from Grok",
    "data": "..." // Response text generated by Grok AI
  }
  ```

#### AI Assist by Task ID
* **URL:** `/api/v1/task/assist/:taskId`
* **Path Parameter:** `taskId` (e.g. `/api/v1/task/assist/65d21a...`)
* **Response (200 OK):**
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Ai Assistance fetched successfully",
    "data": "..." // Grok analysis text based on the specific Task's Title and Description
  }
  ```

---

## 5. Critical Backend Bugs & Fixes

When implementing the frontend, keep in mind these current code bugs found on the backend:

### 1. Missing Route Parameters (`:taskId`) in Router
In [task.router.js](file:///c:/Users/admin/Desktop/WebDevFinal/Project/Nishpadya/src/routes/task.router.js), three routes are defined without route parameters, but their corresponding controller functions attempt to destructure `taskId` from `req.params`.

* **Problematic Route Registrations:**
  ```javascript
  router.route("/updateTask").post(verifyJWT, updateTask)
  router.route("/deleteTask").post(verifyJWT, deleteTask)
  router.route("/getTaskById").post(verifyJWT, getTaskById)
  ```
* **Controller Expectations:**
  ```javascript
  const { taskId } = req.params; // Expects taskId to be in route parameters, but it's not defined in the route.
  ```
* **Result:** Calling these endpoints as defined will fail (returning task not found or unauthorized because `taskId` is `undefined`).
* **Recommended Fix:** Change the route registrations in `task.router.js` to:
  ```javascript
  router.route("/updateTask/:taskId").post(verifyJWT, updateTask)
  router.route("/deleteTask/:taskId").post(verifyJWT, deleteTask)
  router.route("/getTaskById/:taskId").post(verifyJWT, getTaskById)
  ```

### 2. Argument Order Mismatch in `loginUser` Response
In [user.controller.js](file:///c:/Users/admin/Desktop/WebDevFinal/Project/Nishpadya/src/controllers/user.controller.js) (around line 90), the `loginUser` function returns an API Response structured as follows:
```javascript
return res.status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponce(
            {
                loggedInUser, accessToken, refreshToken
            },
            200,
            "User logged in successfully"
        )
    )
```
* **Problem:** The `ApiResponce` constructor is defined as `constructor(statusCode, data, message = "Success")`. Because the parameters are swapped, the returned JSON will look like this:
  ```json
  {
    "statusCode": {
      "loggedInUser": { ... },
      "accessToken": "...",
      "refreshToken": "..."
    },
    "data": 200,
    "message": "User logged in successfully",
    "success": false // Since object < 400 is false
  }
  ```
* **Recommended Fix:** Swap the arguments to the constructor in `user.controller.js`:
  ```javascript
  new ApiResponce(
      200,
      { loggedInUser, accessToken, refreshToken },
      "User logged in successfully"
  )
  ```

---

## 6. Frontend Integration Examples

Here are JavaScript integration examples using `axios` (with cookie credentials enabled) showing how to call these routes correctly.

### API Client Setup
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Replace 8000 with your actual backend port
  withCredentials: true, // Crucial for sending and receiving HTTP-only cookies (session auth)
  headers: {
    'Content-Type': 'application/json',
  }
});

// Optional: Add Authorization header dynamically if cookies are not used or as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
```

### 1. User Registration (Multipart FormData)
```javascript
async function registerUser(name, email, password, avatarFile) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }

  try {
    const response = await api.post('/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Registration Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration Error:', error.response?.data || error.message);
    throw error;
  }
}
```

### 2. User Login
```javascript
async function login(email, password) {
  try {
    const response = await api.post('/users/login', { email, password });
    
    // Note: Due to the backend login response bug, you may need to access 
    // user/token info from response.data.statusCode instead of response.data.data
    const loginData = response.data.data === 200 ? response.data.statusCode : response.data.data;
    
    const { accessToken, loggedInUser } = loginData;
    
    // Store in localStorage if needed (cookies are already stored by the browser)
    localStorage.setItem('accessToken', accessToken);
    
    console.log('Login Success. User:', loggedInUser);
    return loggedInUser;
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
    throw error;
  }
}
```

### 3. Fetch All Tasks
```javascript
async function fetchTasks() {
  try {
    const response = await api.post('/task/getTask');
    console.log('Tasks:', response.data.data);
    return response.data.data; // Returns array of tasks
  } catch (error) {
    console.error('Fetch Tasks Error:', error.response?.data || error.message);
    throw error;
  }
}
```

### 4. Create a Task
```javascript
async function createTask(taskDetails) {
  // taskDetails format: { title, description, status, priority, dueDate }
  try {
    const response = await api.post('/task/createTask', taskDetails);
    console.log('Task Created:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Create Task Error:', error.response?.data || error.message);
    throw error;
  }
}
```

### 5. Update a Task (Working around the path parameter bug)
If you apply the recommended fix (`/updateTask/:taskId`), call it like this:
```javascript
async function updateTask(taskId, updatedDetails) {
  try {
    const response = await api.post(`/task/updateTask/${taskId}`, updatedDetails);
    console.log('Task Updated:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Update Task Error:', error.response?.data || error.message);
    throw error;
  }
}
```

### 6. AI Assist for a specific Task
```javascript
async function getTaskAiAssist(taskId) {
  try {
    const response = await api.post(`/task/assist/${taskId}`);
    console.log('AI Assistance:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('AI Assistance Error:', error.response?.data || error.message);
    throw error;
  }
}
```
