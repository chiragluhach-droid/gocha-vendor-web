# Vendor Dashboard Web App

A web-based dashboard for restaurant vendors to manage orders and menu items.

## Features

- **Authentication**: Secure login using restaurant ID and passkey
- **Restaurant ID Lookup**: Built-in tool to find your restaurant ID
- **Real-time Orders**: Live updates for incoming orders via WebSocket
- **Order Management**: View, accept, and mark orders as ready/delivered
- **Menu Management**: Add, edit, and toggle availability of menu items
- **Responsive Design**: Works on desktop and mobile devices

## Getting Your Restaurant ID

Vendors need their Restaurant ID and passkey to log in. Here's how to get them:

### Option 1: Use the Built-in Lookup Tool
1. Go to the login page
2. Click the "Find ID" button next to the Restaurant ID field
3. Browse or search for your restaurant
4. Click on your restaurant to automatically fill in the ID

### Option 2: Contact System Administrator
- Ask your system administrator to provide your Restaurant ID
- The ID is a long alphanumeric string (MongoDB ObjectId)
- Example: `6975a8a47372bd964f84af50`

### Option 3: Check Database Directly
If you have database access, restaurant IDs can be found in the `restaurants` collection.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Login**: Enter your restaurant ID and passkey
2. **View Orders**: Switch between "Incoming" and "Completed" tabs
3. **Manage Orders**: Click buttons to mark orders as ready or delivered
4. **Manage Menu**: Click "Manage Menu" to add/edit menu items

## API

The app connects to the backend API at `https://gocha-backend.onrender.com`. Make sure the backend is running and accessible.

## Technologies Used

- React
- React Router
- Axios
- Socket.IO Client
