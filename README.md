# M.A.Y. Project Manager

## Setup Instructions

Follow these steps exactly to run the project locally.

---

## 1. Prerequisites

### Node.js (required)
Download and install the LTS version:
https://nodejs.org

Verify installation:
```
node -v
npm -v
```

---

### Docker Desktop (required)
Download and install:
https://www.docker.com/products/docker-desktop

After installing:
- Open Docker Desktop
- Wait until it says "Docker is running"

Verify:
```
docker --version
docker compose version
```

---

## 2. Clone the Repository

```
git clone <YOUR_REPO_URL>
cd <PROJECT_FOLDER_NAME>
```
Or clone with your IDE of choice, such as Visual Studio Code

---

## 4. Start the Application

### macOS / Linux

```
./build.command
```

If permission error:
```
chmod +x build.command
./build.command
```

---

### Windows

Run:
```
build.bat
```

---

### Build Manually (all platforms)

```
docker compose -p maypm -f compose.yaml up -d --build
```

---

## 5. Verify Containers

```
docker ps
```

You should see:
- client
- server
- mongo

---

## 6. Access the Application

Frontend:
http://localhost:5173

Backend:
http://localhost:5001/api/health

Expected response:
```
{
  "message": "Server running"
}
```

---

## 7. Stop the Application

```
docker compose -p maypm down
```

---

## Notes

- MongoDB runs in Docker with persistent storage
- Backend connects using:
  mongodb://mongo:27017/project_manager
- Frontend communicates with backend via HTTP
- If changes are made to `dockerfile`s or `compose.yaml` elements, the containers must be rebuilt