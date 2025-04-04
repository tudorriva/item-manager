🗂️ Item Manager
Item Manager is a full-stack inventory and user management web application built with Node.js, Express, MongoDB, and EJS. It supports user authentication, admin features, shopping cart functionality, and item tracking via a clean, server-rendered UI.

✨ Features
🔐 User authentication (signup, login, JWT tokens)

🧾 Item CRUD operations (create, read, update, delete)

🛒 Cart functionality

📊 Basic admin and user dashboards

📈 Server uptime monitoring route (/api/server-status)

🎨 Templated views using EJS and ejs-mate layout engine

📁 Project Structure
graphql
Copy
Edit
src/
│
├── routes/           # API and page routes
├── controllers/      # Route handlers for auth, items, users, cart, stats
├── models/           # Mongoose models
├── views/            # EJS templates
├── public/           # Static assets
└── app.js            # App entry point
🚀 Getting Started
Clone the repo

bash
Copy
Edit
git clone https://github.com/tudorriva/item-manager.git
cd item-manager
Install dependencies

bash
Copy
Edit
npm install
Set up your .env file

ini
Copy
Edit
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
Run the server

bash
Copy
Edit
npm start
Visit http://localhost:3000 in your browser.

🛠️ Tech Stack
Node.js

Express

MongoDB & Mongoose

EJS & ejs-mate

JWT

Cookie Parser
