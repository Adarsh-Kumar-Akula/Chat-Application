# 💬 Chat Application (Django + React)

A full-stack real-time chat application built with **Django Channels (WebSockets)** for the backend and **React** for the frontend.  
It allows users to **sign up, log in, add friends, and chat in real-time**, all through an intuitive and responsive UI.

---

## 🚀 Tech Stack

### **Backend**
- **Python** (Django Framework)
- **Django Channels** (WebSockets for real-time chat)
- **SQLite / PostgreSQL** (Database)
- **Django REST Framework** (for REST APIs)

### **Frontend**
- **React (Vite)**
- **Axios** (for API calls)
- **WebSocket Client** (for real-time messaging)
- **Tailwind CSS** (for responsive styling)

---

# 💬 Chat Application (Django + React)

A full-stack real-time chat application built with **Django Channels (WebSockets)** for the backend and **React** for the frontend. It allows users to **sign up, log in, log out, add friends, and chat in real-time** with an intuitive and responsive UI.

---

## 🚀 Tech Stack

### Backend
- Python (Django)
- Django Channels (WebSockets)
- SQLite or PostgreSQL (database)
- Django REST Framework (REST APIs)

### Frontend
- React (Vite)
- Axios (API calls)
- WebSocket client (native or library)
- Tailwind CSS (styling)

---

## 🧩 Project Structure (example)

```
Chat-Application/
├── chat_application/               # Django backend (main project)
│   ├── accounts/                   # user signup, login, auth
│   ├── friends/                    # friend requests, listing
│   ├── chat/                       # chat rooms, consumers (WebSockets)
│   ├── chat_application/           # settings, routing
│   └── manage.py                   # Django entrypoint

├── chat-application-frontend/      # React frontend (Vite)
│   ├── src/
│   │   ├── components/             # reusable UI components
│   │   ├── pages/                  # Login, Signup, ChatPage, etc.
│   │   ├── App.jsx                 # routes
│   │   └── main.jsx                # React entrypoint
│   ├── package.json
│   └── vite.config.js

└── README.md
```

---

## ⚙️ Backend Setup (Django)

Follow these steps from the `chat_application` folder (where `manage.py` lives).

1. Create and activate a virtual environment

```powershell
python -m venv venv
.\venv\Scripts\Activate
```

2. Install dependencies

```powershell
pip install -r requirements.txt
```

3. Run migrations

```powershell
python manage.py makemigrations
python manage.py migrate
```


If you don't need real-time features for local testing, you can temporarily use the in-memory channel layer (not recommended for production).

5. Run the Django development server

```powershell
python manage.py runserver
```

The backend will be available at: http://127.0.0.1:8000/

---

## ⚛️ Frontend Setup (React)

From the `chat-application-frontend` folder:

1. Install dependencies

```powershell
cd chat-application-frontend
npm install
```

2. Run the development server

```powershell
npm run dev
```

The frontend will be available at: http://127.0.0.1:5173/



## ✨ Features

- ✅ User Authentication (Signup, Login, Logout)
- ✅ Friend Management (Add friends by username, list friends)
- ✅ Real-time Chat (Django Channels + WebSockets)
- ✅ Responsive Frontend UI (Tailwind CSS)
- ✅ REST APIs for authentication, friends, and chat

---

## 🧠 How It Works

- Django Channels handles WebSocket connections and routes messages to consumers.
- React frontend connects to the backend via WebSocket for real-time chat, while REST APIs handle friend management and authentication and to get chat history.

---

## 🧰 Common Commands

Backend

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Frontend

```powershell
npm install
npm run dev
```

---

## 🏁 License

This project is open-source and available under the MIT License.

---





