# API Documentation

## Base URL

```
https://clark-v2-0.onrender.com
```

## Authentication

### JWT Authentication

All endpoints that require authentication WOULD include a Bearer token in the header:

```
Authorization: Bearer <token>
```

### Middleware

- **`Neccessary middlewares would be listed here`**

## Endpoints

### **Waitlist Endpoints**

#### **1. User Registration**

**URL:** `/api/v1/waitlist`  
**Method:** `POST`  
**Description:** Register a new user to the waitlist with the provided credentials.

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone_number": "string"
}
```

**Success Response:**

- **Code:** 201
- **Content:**

```json
{ "success": true, "message": "Your waitlist entry has been recorded." }
```

**Error Responses:**

- **Code:** 409 CONFLICT
  **Content:** `{"error":"User already exists.","message":"You're already on the waitlist!"}`
  User already registered for waitlist earlier.

- **Code:** 400 BAD REQUEST  
  **Content:** `{"error":"Bad request."}`
  Make sure all parameters are provided.

#### **2. User Retreival**

**URL:** `/api/v1/waitlist`  
**Method:** `GET`  
**Description:** Retreive a registered user.

**Route parameters: email(optional). If provided, it returns the user with the associated email, and if not, returns all users that have regoistered the waitlist**

**Success Response:**

- **Code:** 200
- **Content:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ashiru Sheriffdeen Olanrewaju",
    "phone_number": "+2341276876098",
    "email": "abc123@gmail.com",
    "source": "whatsapp",
    "createdAt": "2025-03-02T01:48:01.000Z",
    "updatedAt": "2025-03-02T01:48:01.000Z"
  }
}
```

**Error Responses:**

- **Code:** 400 BAD REQUEST  
  **Content:** `{"error":"Bad request."}`
  Make sure all parameters are provided.


#### **3. User Deletion.**

**URL:** `/api/v1/waitlist`  
**Method:** `DELETE`  
**Description:** Delete a registered user.

**Query parameters: email(Compulsory).**

**Success Response:**

- **Code:** 204
- **Content:**

```text
Empty
```

**Error Responses:**

- **Code:** 400 BAD REQUEST  
  **Content:** `{error: "Bad request.", message: "Email is not provided."}`
  Make sure email is provided.
