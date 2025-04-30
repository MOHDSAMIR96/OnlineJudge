🧑‍💻 Online Judge
An online coding platform where users can solve coding problems, submit their solutions, and view rankings on the leaderboard — similar to LeetCode, Codeforces, and HackerRank.

🚀 Features
User Registration and Login (JWT Authentication)

Problem Management (CRUD for coding problems)

Online Code Editor (Supports C++, Java, and Python)

Code Execution with Custom Input

Automatic Test Case Evaluation

Leaderboard Ranking based on User Scores

Responsive and clean UI

Admin functionality (Create Problems)

🛠️ Tech Stack
Frontend | Backend | Database
React.js | Node.js | MongoDB
TailwindCSS | Express.js | Mongoose ODM
Monaco Editor | Axios (API Calls) | 

📂 Project Structure
/frontend         --> React frontend
/backend         --> Node.js backend
  /controllers  --> All controller logic
  /models       --> Mongoose models (User, Problem, TestCase,submission Leaderboard)
  /routes       --> API routes

  📜 Installation
  1. Clone the repository
   git clone https://github.com/yourusername/onlinejudge.git
   cd onlinejudge

   2. Setup Backend (backend)
   cd backend
   npm install

   Create a .env file inside /backend:
   PORT=8000
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_secret_key

  Start the backend:
  npx nodemon index.js

  Backend runs on: http://localhost:8000/

  3. Setup Frontend (frontend)
  cd frontend
  npm install

  Start the frontend:
  npm run dev

  Frontend runs on: http://localhost:5173/
