# HopKing-IoT

We created a 2d platformer game that uses your body poses extracted from a pose recognition model as the controls. A webcam is needed to run the game.

## Installation Instructions

Follow these steps to set up HopKing-IoT on your local machine:

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/en/) installed on your system. This project requires Node.js version 14.x or higher.

### Setup

1. **Clone the Repository** (skip this step if you've already cloned or have the project files)

   Open your terminal, navigate to the directory where you want the project to be located, and run: git clone https://github.com/your-username/HopKing-IoT.git

   Replace `your-username` with the actual GitHub username or the organization/user under which the repository is hosted.

2. **Navigate to the Project Directory**

- After cloning, move into the project directory:
  ```
  cd HopKing-IoT
  ```

3. **Install Dependencies**

- To ensure a fresh start, delete the existing `package-lock.json` file:
  ```
  rm package-lock.json
  ```


- Then, install the project dependencies:
   ```
   npm install
   ```

- This command installs the necessary packages specified in the `package.json` file.

4. **Start Express Server**

- Go to server directory and start the server:
  ```
  cd hopking-server
  node server.js
  ```
5. **Start the Development Server**

- Start the development server to run the project locally:
   ```
   npx vite dev
   ```

- Or, if a script is specified in the `package.json`:
   ```
   npm run dev
   ```

- This command will start the development server. The terminal output will provide the local URL where the project is running (usually `http://localhost:3000` or similar).
- Open up two side-by-side terminals for the server and Pixi-Vite app.

