# 🎨 Real-Time Collaborative Whiteboard

> A full-stack, real-time collaborative whiteboard application where multiple users can create, edit, share, and collaborate on digital canvases simultaneously.

Built with **React, Node.js, Express.js, Socket.IO, MongoDB, Rough.js, and JWT authentication**.

---

## 🚀 Overview

Users can create multiple canvases, draw using different tools, share canvases with other registered users, and see drawing changes from collaborators in real time.

The core engineering challenge is maintaining synchronization between multiple clients while keeping the drawing experience responsive.

### ✨ What makes this project interesting?

* ⚡ Real-time multi-user collaboration using Socket.IO
* 🎨 Custom HTML5 Canvas drawing engine
* 🔄 Undo/Redo history management
* 🔐 JWT-based authentication
* 👥 Canvas sharing with access control
* 💾 MongoDB persistence
* 🚀 In-memory caching for faster canvas access
* 🖌️ Hand-drawn rendering using Rough.js
* ✏️ Smooth freehand drawing using perfect-freehand
* 📥 Canvas export as PNG

---

## 🖼️ Core Features

### 🎨 Drawing Tools

The whiteboard supports:

* 🖌️ Brush / Freehand
* 📏 Line
* ▭ Rectangle
* ⭕ Circle
* ➡️ Arrow
* 🔤 Text
* 🧹 Eraser

Drawing properties such as stroke color, fill color, and size can be configured through the toolbox.

---

### ⚡ Real-Time Collaboration

Multiple users can work on the same canvas simultaneously.

Each canvas is represented as a **Socket.IO room**.

```text
User A
   │
   │ drawingUpdate
   ▼
Socket.IO Server
   │
   ├──► User B
   ├──► User C
   └──► User D
```

When a user finishes a drawing action:

```text
Draw
  ↓
createElement()
  ↓
React reducer
  ↓
drawingUpdate
  ↓
Socket.IO Server
  ↓
Broadcast to canvas room
  ↓
Other clients receive update
  ↓
Canvas re-render
  ↓
MongoDB persistence
```

This room-based architecture ensures that users only receive updates for the canvas they are currently collaborating on.

---

## 🔐 Authentication

Authentication is implemented using **JWT**.

### Registration

```text
Client
  ↓
POST /api/users/register
  ↓
Check existing user
  ↓
bcrypt password hashing
  ↓
Create MongoDB user
```

### Login

```text
Client
  ↓
POST /api/users/login
  ↓
Find user
  ↓
bcrypt.compare()
  ↓
Generate JWT
  ↓
Return token
```

The JWT is used for both:

* REST API authentication
* Socket.IO authentication

Protected API requests use:

```http
Authorization: Bearer <token>
```

---

## 👥 Canvas Sharing

Canvas owners can share their canvases with other registered users by email.

The sharing flow is:

```text
Owner
  ↓
Enter collaborator email
  ↓
Find user
  ↓
Verify canvas ownership
  ↓
Add user ID to shared[]
  ↓
Save canvas
  ↓
Collaborator can access canvas
  ↓
Socket.IO validates access
```

A user can access canvases where they are either:

```text
owner == userId
        OR
userId ∈ shared[]
```

---

## 🧠 Drawing Engine

The project uses the **HTML5 Canvas API** as the primary rendering surface.

### Rough.js

Rough.js is used for geometric shapes to provide a hand-drawn/sketch-like appearance.

```text
Line
Rectangle
Circle
Arrow
   ↓
Rough.js
   ↓
Canvas rendering
```

### perfect-freehand

Freehand strokes use `perfect-freehand` to generate smooth brush paths.

```text
Mouse Points
     ↓
perfect-freehand
     ↓
SVG Path
     ↓
Path2D
     ↓
Canvas
```

---

## 🧹 Eraser & Hit Testing

The eraser is implemented using custom hit-testing logic.

Different element types use different geometric checks:

| Element   | Hit Detection               |
| --------- | --------------------------- |
| Line      | Point-to-line distance      |
| Arrow     | Line/segment proximity      |
| Rectangle | Edge proximity              |
| Circle    | Distance from circumference |
| Brush     | `Path2D.isPointInPath()`    |

When an element is detected:

```text
Mouse Position
      ↓
Hit Test
      ↓
Element Found
      ↓
Filter Element
      ↓
Update Canvas State
```

This was one of the more algorithmically interesting parts of the project.

---

## 🔄 Undo / Redo

Undo and redo are implemented using a history-based approach similar to the **Memento pattern**.

Conceptually:

```text
history = [
  [],
  [element1],
  [element1, element2],
  [element1, element2, element3]
]
```

An index tracks the current state.

### Undo

```text
index--
↓
Render history[index]
```

### Redo

```text
index++
↓
Render history[index]
```

If a new drawing is created after undoing, the future history is discarded.

---

## 💾 Persistence Architecture

The application uses a **dual-persistence strategy**:

```text
                 ┌──────────────────┐
                 │   React Client   │
                 └────────┬─────────┘
                          │
                          │ drawingUpdate
                          ▼
                 ┌──────────────────┐
                 │    Socket.IO     │
                 └────────┬─────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
      ┌────────────────┐      ┌────────────────┐
      │ Memory Cache   │      │   MongoDB      │
      │ canvasData[]   │      │ Atlas          │
      └────────────────┘      └────────────────┘
             │                        │
        Fast reads                Durability
```

### Why both?

**In-memory cache**

* Faster reads
* Avoids unnecessary database queries
* Useful for active collaborative sessions

**MongoDB**

* Persistent storage
* Canvas survives server restarts
* Provides durable application state

This is intentionally a trade-off between **real-time performance and persistence**.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                            │
│                                                         │
│  React                                                   │
│   │                                                     │
│   ├── Board                                              │
│   ├── Toolbar                                            │
│   ├── Toolbox                                            │
│   ├── Sidebar                                            │
│   ├── Login / Register                                   │
│   │                                                     │
│   ├── Context API + useReducer                           │
│   │                                                     │
│   └── Socket.IO Client                                   │
│                │                                         │
└────────────────┼─────────────────────────────────────────┘
                 │
          HTTP + WebSocket
                 │
┌────────────────▼─────────────────────────────────────────┐
│                     BACKEND                              │
│                                                         │
│  Node.js + Express                                      │
│       │                                                 │
│       ├── REST API                                      │
│       │                                                 │
│       ├── Authentication                                │
│       │                                                 │
│       └── Socket.IO Server                              │
│                  │                                      │
│                  ▼                                      │
│              MongoDB Atlas                              │
│                  │                                      │
│              Mongoose ODM                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer             | Technology                 | Purpose                  |
| ----------------- | -------------------------- | ------------------------ |
| Frontend          | React                      | Component-based UI       |
| Rendering         | HTML5 Canvas               | Whiteboard rendering     |
| State             | Context API + useReducer   | Drawing state            |
| Drawing           | Rough.js                   | Hand-drawn shapes        |
| Freehand          | perfect-freehand           | Smooth brush strokes     |
| Styling           | Tailwind CSS + CSS Modules | UI styling               |
| HTTP              | Axios                      | REST API communication   |
| Real-time         | Socket.IO                  | WebSocket communication  |
| Backend           | Node.js                    | Server runtime           |
| API               | Express.js                 | REST API                 |
| Database          | MongoDB Atlas              | Persistent storage       |
| ODM               | Mongoose                   | MongoDB data modeling    |
| Authentication    | JWT                        | Token authentication     |
| Password Security | bcrypt                     | Password hashing         |
| Deployment        | Vercel + Render            | Frontend/backend hosting |

---

## 📁 Project Structure

```text
whiteboard_az-main/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── userController.js
│   │   └── canvasController.js
│   │
│   ├── middlewares/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── userModel.js
│   │   └── canvasModel.js
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── canvasRoutes.js
│   │
│   ├── server.js
│   ├── vercel.json
│   └── package.json
│
└── whiteboard-tutorial/
    │
    ├── public/
    │
    ├── src/
    │   ├── components/
    │   │   ├── Board/
    │   │   ├── Toolbar/
    │   │   ├── Toolbox/
    │   │   ├── Sidebar/
    │   │   ├── Login/
    │   │   └── Register/
    │   │
    │   ├── store/
    │   │   ├── BoardProvider.js
    │   │   ├── ToolboxProvider.js
    │   │   ├── board-context.js
    │   │   └── toolbox-context.js
    │   │
    │   ├── utils/
    │   │   ├── api.js
    │   │   ├── socket.js
    │   │   ├── element.js
    │   │   └── math.js
    │   │
    │   ├── constants.js
    │   ├── App.js
    │   └── index.js
    │
    ├── tailwind.config.js
    └── package.json
```

---

## 🔌 REST API

### Authentication

| Method | Endpoint              | Auth | Description           |
| ------ | --------------------- | ---- | --------------------- |
| `POST` | `/api/users/register` | ❌    | Register user         |
| `POST` | `/api/users/login`    | ❌    | Login and receive JWT |
| `GET`  | `/api/users/me`       | ✅    | Get current user      |

### Canvas

| Method   | Endpoint                  | Auth | Description         |
| -------- | ------------------------- | ---- | ------------------- |
| `POST`   | `/api/canvas/create`      | ✅    | Create canvas       |
| `PUT`    | `/api/canvas/update`      | ✅    | Save canvas         |
| `GET`    | `/api/canvas/load/:id`    | ✅    | Load canvas         |
| `GET`    | `/api/canvas/list`        | ✅    | List user canvases  |
| `PUT`    | `/api/canvas/share/:id`   | ✅    | Share canvas        |
| `PUT`    | `/api/canvas/unshare/:id` | ✅    | Remove collaborator |
| `DELETE` | `/api/canvas/delete/:id`  | ✅    | Delete canvas       |

---

## 🔌 WebSocket Events

| Event                  | Direction       | Purpose              |
| ---------------------- | --------------- | -------------------- |
| `joinCanvas`           | Client → Server | Join canvas room     |
| `loadCanvas`           | Server → Client | Send existing canvas |
| `drawingUpdate`        | Client → Server | Send drawing changes |
| `receiveDrawingUpdate` | Server → Client | Broadcast changes    |
| `unauthorized`         | Server → Client | Access denied        |

---

## 🗄️ Database Design

### Users

```javascript
{
  _id: ObjectId,
  email: String,
  password: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Canvases

```javascript
{
  _id: ObjectId,
  owner: ObjectId,
  shared: [ObjectId],
  elements: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Drawing Element

```javascript
{
  id: Number,
  x1: Number,
  y1: Number,
  x2: Number,
  y2: Number,
  type: String,
  stroke: String,
  fill: String,
  size: Number,
  text: String,
  points: [{ x, y }],
  roughEle: Object
}
```

---

## 🔁 Real-Time Synchronization

The central synchronization flow is:

```text
User A
  │
  │ Draws
  ▼
Board Component
  │
  │ createElement / updateElement
  ▼
React State
  │
  │ drawingUpdate
  ▼
Socket.IO Server
  │
  ├──► Update in-memory canvas state
  │
  ├──► Broadcast to canvas room
  │
  └──► Persist to MongoDB
               │
               ▼
        User B / User C
               │
               ▼
      receiveDrawingUpdate
               │
               ▼
         Update State
               │
               ▼
        Re-render Canvas
```

The implementation currently uses **full-state synchronization**, meaning the complete elements array is transmitted on drawing updates. This keeps the implementation relatively simple, but bandwidth usage grows with canvas complexity.

---

## 🧩 Important Engineering Decisions

### Why Context API instead of Redux?

The application has two primary state domains:

* Board/drawing state
* Toolbox/tool configuration

`Context API + useReducer` provides a clean reducer-based architecture without introducing Redux's additional configuration and dependencies.

The trade-off is that Redux or another state-management solution could become more appropriate as the application grows significantly.

---

### Why Socket.IO Rooms?

Each canvas maps directly to a Socket.IO room.

```javascript
socket.join(canvasId);
```

Updates are then broadcast only to users in that room.

```javascript
socket.to(canvasId).emit(
  "receiveDrawingUpdate",
  elements
);
```

This isolates collaboration between different canvases and avoids broadcasting unrelated drawing events to other users.

---

### Why MongoDB?

Canvas elements are naturally represented as flexible documents containing different element types and properties.

MongoDB provides a convenient document structure for storing these heterogeneous drawing elements.

---

## ⚖️ Current Trade-offs

This project intentionally favors implementation simplicity and clear architecture over production-scale distributed collaboration.

| Decision                   | Advantage                    | Trade-off                               |
| -------------------------- | ---------------------------- | --------------------------------------- |
| Full-state synchronization | Simple implementation        | Higher bandwidth                        |
| In-memory cache            | Fast reads                   | Lost on restart                         |
| MongoDB persistence        | Durable storage              | More DB writes                          |
| Context API                | Lightweight                  | Less scalable than larger state systems |
| Socket.IO                  | Easy real-time communication | Single-server limitation                |
| Last-write-wins            | Simple conflict handling     | Concurrent edits can overwrite          |
| Canvas full redraw         | Simple Canvas model          | Rendering cost grows with elements      |

---

## ⚠️ Known Limitations

This is an educational/interview-focused implementation and has several production-readiness limitations:

* Single Socket.IO server
* In-memory cache is not shared across instances
* Full-state synchronization can become bandwidth-heavy
* No CRDT/OT conflict resolution
* Canvas list pagination is not implemented
* No explicit element limit per canvas
* Authentication currently uses localStorage
* Token expiration/refresh mechanism is not implemented
* Rate limiting requires improvement
* Production secrets should be managed through environment variables
* Production CORS should use a strict origin allowlist

These limitations are documented intentionally because understanding system trade-offs is an important part of the project's architecture.

---

## 🔒 Security Improvements for Production

Before deploying a production version, the following improvements should be made:

* Move JWT secrets to environment variables
* Rotate secrets periodically
* Add JWT expiration and refresh tokens
* Prefer `httpOnly` cookies for browser authentication
* Add request validation
* Add login rate limiting
* Restrict CORS to trusted frontend origins
* Add WebSocket abuse protection
* Add payload-size limits
* Add proper secret management
* Consider stronger authentication/authorization policies

The current implementation explicitly identifies hardcoded secrets, token lifetime, localStorage usage, validation, rate limiting, and CORS as areas requiring improvement.

---

## 📈 Scalability Roadmap

A production-scale version could evolve toward:

```text
                 ┌─────────────────┐
                 │ Load Balancer   │
                 └────────┬────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Server 1     Server 2     Server 3
             │            │            │
             └────────────┼────────────┘
                          │
                       Redis
                          │
                Socket.IO Adapter
                          │
                       MongoDB
```

### Planned improvements

* [ ] Yjs / CRDT-based synchronization
* [ ] Incremental operation-based updates
* [ ] Redis Socket.IO adapter
* [ ] Distributed caching
* [ ] LRU/TTL cache eviction
* [ ] Canvas pagination
* [ ] Canvas element limits
* [ ] Zoom and pan
* [ ] Infinite canvas
* [ ] Real-time cursor presence
* [ ] Comments
* [ ] Version history
* [ ] PNG/SVG/PDF export
* [ ] Stronger authentication
* [ ] TypeScript migration

CRDT-based synchronization and Redis-backed Socket.IO scaling are the major architectural improvements identified for handling larger collaborative workloads.

---

## 🚀 Deployment

The intended deployment architecture is:

```text
Frontend
   ↓
Vercel

Backend
   ↓
Render

Database
   ↓
MongoDB Atlas
```

The frontend is deployed separately from the backend because the backend maintains persistent Socket.IO connections; a serverless-only deployment model is not suitable for this Socket.IO architecture.

---

## 🧪 Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* MongoDB Atlas account
* Git

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd whiteboard_az-main
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment

Create your environment configuration using the variables required by your backend deployment.

Example:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secure-secret>
```

> Never commit real credentials or secrets to Git.

### 4. Start backend

```bash
npm start
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd whiteboard-tutorial
npm install
```

### 6. Start frontend

```bash
npm start
```

The frontend and backend should then communicate through the configured HTTP and Socket.IO endpoints.

---

## 🧠 Technical Highlights

This project demonstrates practical understanding of:

* React component architecture
* React Context API
* `useReducer`
* HTML5 Canvas
* Canvas coordinate systems
* Geometry and hit-testing
* Point-to-line distance
* Path-based collision detection
* Trigonometry for arrow rendering
* WebSocket communication
* Socket.IO rooms
* REST API design
* JWT authentication
* bcrypt password hashing
* MongoDB document modeling
* Mongoose ODM
* Client/server state synchronization
* Caching strategies
* Undo/redo state history
* Full-stack deployment

---

## 💡 Key Learning Outcomes

The most important engineering lessons from this project are:

1. **Real-time synchronization is harder than normal CRUD.**
2. **WebSocket architecture requires thinking about rooms, connection lifecycle, and concurrent updates.**
3. **Canvas applications require geometry and hit-testing algorithms.**
4. **Caching improves performance but introduces consistency and memory-management concerns.**
5. **Authentication and authorization are separate concerns.**
6. **A working architecture is not automatically a production-ready architecture.**
7. **Scaling real-time applications requires distributed state and conflict-resolution strategies.**

---

## 🎯 Project Objective

The goal of this project was not simply to build a drawing application.

It was to understand how a collaborative application handles:

```text
User Interaction
       ↓
Frontend State
       ↓
Real-Time Transport
       ↓
Server Coordination
       ↓
Persistence
       ↓
Other Connected Clients
```

The project therefore focuses heavily on **real-time systems, state management, drawing algorithms, authentication, persistence, and scalable architecture**.

---

## 📚 Interview / System Design Value

This project provides practical discussion points around:

* WebSocket vs HTTP
* Socket.IO room architecture
* Full-state vs incremental synchronization
* Last-write-wins vs CRDT
* In-memory caching vs persistent storage
* Context API vs Redux
* Canvas vs SVG
* Authentication over HTTP and WebSockets
* Horizontal scaling
* Redis adapters
* MongoDB schema design
* Hit-testing algorithms
* Undo/redo architecture
* Security trade-offs

It is particularly useful as a **full-stack + real-time systems portfolio project**.

---

## 👨‍💻 Author

**Your Name**

Built as a full-stack engineering project to explore real-time collaboration, interactive graphics, distributed state synchronization, and scalable web architecture.

---

## ⭐ If You Found This Project Interesting

Consider giving the repository a ⭐ and exploring the architecture, implementation, and future scalability improvements.

---

## 📄 License

This project is available for educational and portfolio purposes.
