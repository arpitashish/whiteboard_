# Whiteboard

A collaborative, browser-based whiteboard for sketching ideas, mapping concepts, and working visually in real time. The project combines a React drawing interface with an Express, MongoDB, and Socket.IO backend for canvas persistence and live updates.

> **Live application:** [whiteboard-xi-beryl.vercel.app](https://whiteboard-xi-beryl.vercel.app)
**API:** [whiteboard-d37k.onrender.com](https://whiteboard-d37k.onrender.com)

## Highlights

- Create, switch between, and delete independent canvases.

- Draw freehand strokes with a smooth brush experience powered by `perfect-freehand`.

- Add lines, rectangles, circles, arrows, and text.

- Change stroke, fill, and brush sizing through the toolbox.

- Erase elements and move through drawing history with undo and redo.

- Persist canvas elements in MongoDB.

- Synchronize drawing changes between connected clients with Socket.IO.

- Use the responsive React interface locally or deploy the frontend and backend independently.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router, Axios, Rough.js, Perfect Freehand, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB with Mongoose |
| Frontend hosting | Vercel or any static hosting provider |
| Backend hosting | Render, Vercel server deployment, or another Node-compatible host |

## Project structure

```
.
├── backend/
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Canvas and user request handlers
│   ├── middlewares/         # Authentication middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # REST endpoints
│   ├── server.js            # Express and Socket.IO entry point
│   ├── package.json
│   └── vercel.json
├── whiteboard-tutorial/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Board, Sidebar, Toolbar, and Toolbox
│   │   ├── store/            # Board and toolbox state providers
│   │   ├── utils/            # Drawing, geometry, API, and socket helpers
│   │   ├── App.js
│   │   └── constants.js
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## Requirements

- Node.js 18 or newer

- npm 9 or newer

- A MongoDB database, local or hosted

- Git, if you are cloning the repository

## Run locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd whiteboard_
```

### 2. Configure the backend

Create `backend/.env`:

```
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
```

`MONGO_URL` is required by the database connection. `JWT_SECRET` is used by the user authentication code. Never commit `.env` files or database credentials to GitHub.

Install and start the backend:

```bash
cd backend
npm install
npm start
```

The backend listens on `http://localhost:5000`.

### 3. Configure the frontend API URL

The current frontend points to the deployed API at:

```
https://whiteboard-d37k.onrender.com/api
```

For local development, update the API base URLs in these frontend files to point to your local backend:

- `whiteboard-tutorial/src/utils/api.js`

- `whiteboard-tutorial/src/components/Sidebar/index.js`

- Any other component containing `whiteboard-d37k.onrender.com`

A typical local API base is:

```
http://localhost:5000/api
```

### 4. Install and start the frontend

Open a second terminal:

```bash
cd whiteboard-tutorial
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

### Frontend

Run these commands from `whiteboard-tutorial/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the React development server on port 3000 |
| `npm run build` | Create an optimized production build in `build/` |
| `npm test` | Run the React test runner |

### Backend

Run these commands from `backend/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Express and Socket.IO server on port 5000 |

## API reference

The backend exposes the following REST endpoints under `/api`.

### Canvas endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/canvas/create` | Create an empty canvas |
| `GET` | `/api/canvas/list` | Return available canvases, newest first |
| `GET` | `/api/canvas/load/:id` | Load a canvas and its elements |
| `PUT` | `/api/canvas/update` | Replace a canvas's elements; body requires `canvasId` and `elements` |
| `DELETE` | `/api/canvas/delete/:id` | Delete a canvas |

Example update request:

```bash
curl -X PUT https://whiteboard-d37k.onrender.com/api/canvas/update \
  -H "Content-Type: application/json" \
  -d '{"canvasId":"<canvas-id>","elements":[]}'
```

### User endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/users/register` | Register a user |
| `POST` | `/api/users/login` | Log in and receive an authentication token |
| `GET` | `/api/users/me` | Return the authenticated user; requires an authorization token |

## Real-time collaboration

The backend uses Socket.IO to broadcast drawing changes. Clients join a canvas room with a `joinCanvas` event and send updates through `drawingUpdate`.

| Event | Direction | Purpose |
| --- | --- | --- |
| `joinCanvas` | Client → server | Join a canvas room using `{ canvasId }` |
| `loadCanvas` | Server → client | Send the current elements after joining |
| `drawingUpdate` | Client → server | Save and broadcast `{ canvasId, elements }` |
| `receiveDrawingUpdate` | Server → client | Deliver a drawing update to other room members |

## Deploy to Vercel and Render

### Frontend on Vercel

1. Push the repository to GitHub.

1. Import the repository into Vercel.

1. Set the project root to `whiteboard-tutorial`.

1. Use the following settings:
  - **Install command:** `npm install` or `npm ci`
  - **Build command:** `npm run build`
  - **Output directory:** `build`

1. Deploy.

The production build has been verified successfully after correcting the ESLint issues and regenerating the frontend lockfile.

### Backend on Render

1. Create a new **Web Service** from the repository.

1. Set the root directory to `backend`.

1. Use:
  - **Build command:** `npm install`
  - **Start command:** `npm start`

1. Add `MONGO_URL` and `JWT_SECRET` under Render Environment Variables.

1. Update the Socket.IO CORS allowlist in `backend/server.js` if the frontend domain changes.

The backend currently listens on port `5000`. For hosts that provide a dynamic `PORT`, update the server to use `process.env.PORT || 5000` before deployment.

## Vercel build troubleshooting

If Vercel reports ESLint warnings as compilation errors:

1. Make sure the latest `whiteboard-tutorial/package-lock.json` is committed.

1. Run:

   ```bash
   cd whiteboard-tutorial
   npm install
   npm run build
   ```

1. Commit both source changes and the regenerated lockfile.

1. Redeploy from Vercel.

The frontend build command intentionally sets `CI=false` for Create React App compatibility, but the code should still remain warning-free so that other CI environments can build it reliably.

## Security notes

- Do not commit `backend/.env`, MongoDB credentials, JWT secrets, or production tokens.

- Restrict CORS to trusted frontend origins before exposing the backend publicly.

- Add authentication checks to canvas routes if canvases should be private or user-owned.

- Validate canvas IDs and element payloads server-side before storing them.

- Use HTTPS in production and rotate credentials if they have ever been exposed.

## Current limitations

- Canvas listing and canvas CRUD currently operate globally rather than enforcing ownership per authenticated user.

- The frontend contains deployed API URLs in source files; consider moving them to a build-time environment variable such as `REACT_APP_API_URL`.

- The backend Socket.IO CORS configuration includes a fixed frontend origin and should be updated when the deployment domain changes.

- The dependency tree contains older transitive packages that may produce deprecation or audit warnings even though the production build succeeds.

## Contributing

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-change
   ```

1. Make the change and run the frontend build:

   ```bash
   cd whiteboard-tutorial
   npm run build
   ```

1. Keep secrets out of commits.

1. Open a pull request with a concise description and verification steps.

## License

No license has been declared yet. Add a `LICENSE` file before distributing or accepting external contributions under a specific open-source license.
