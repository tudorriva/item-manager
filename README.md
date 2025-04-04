# 🗂️ Item Manager

Item Manager is a full-stack inventory and user management web application built with **Node.js**, **Express**, **MongoDB**, and **EJS**. It provides a simple, server-rendered interface where users can register, log in, manage items, and use a basic shopping cart system. Admin and user roles are supported, and backend APIs are cleanly structured for easy extension.

---

## ✨ Features

- 🔐 **User Authentication** – Signup, login, and JWT-based session handling
- 🧾 **Item Management** – Create, update, delete, and list items
- 🛒 **Cart System** – Add items to a user cart and view contents
- 📊 **Admin/User Dashboards** – Different UI flows for admin and regular users
- 💡 **EJS Templating** – Dynamic, server-side rendered pages using EJS and `ejs-mate`
- 📈 **Server Health Endpoint** – `/api/server-status` returns basic uptime info

---

## 📁 Project Structure

src/ │ ├── controllers/ # Logic for routes (auth, item, user, cart, stats) ├── models/ # Mongoose schemas for User, Item, Cart ├── routes/ # API endpoints and view routes ├── views/ # EJS templates for pages ├── public/ # Static assets (CSS, images) └── app.js # Main server entry point

🛠️ Built With
Node.js

Express.js

MongoDB

Mongoose

EJS

ejs-mate

JWT

Cookie-Parser
