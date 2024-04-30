import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import PixiGame from './PixiGame';
import io from 'socket.io-client';
// import * as tf from '@tensorflow/tfjs';
// import * as tmPose from '@teachablemachine/pose';  // Ensure this import is correct

// At the top of a React component or a JavaScript module

const tmPose = window.tmPose;
let previous = null;
const serverURL = 'http://10.8.17.26:3000'; // Max's Laptop
//const serverURL = 'http://192.168.0.182:3000'; //Max's Laptop 2
//const serverURL = 'http://10.8.17.12:3000'; // Sam's Laptop
//const serverURL = 'http://172.17.47.107:3000/'; // Sam's Laptop, but in the SC
//const serverURL = 'http://localhost:3000';
const App = () => {
  const [socket, setSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [playerData, setPlayerData] = useState({});
  const [winnerData, setWinnerData] = useState({});
  const [inLobby, setInLobby] = useState(false);
  const [lobbyCount, setLobbyCount] = useState(0);
  const [playersInLobby, setPlayersInLobby] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false); // State to control the visibility of the leaderboard popup
  const [leaderboard, setLeaderBoard] = useState({});
  const [model, setModel] = useState(null); // State for the Teachable Machine model
  const [maxPredictions, setMaxPred] = useState(null);
  const [playerMove, setPlayerMove] = useState(null);
  const [cameraOptions, setCameraOptions] = useState([]);
  const [camera, setCamera] = useState(null);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const videoRef = useRef(null);
  //const playerMoveRef = useRef(null);

  //let webcam;

  const joinLobby = () => {

    if (!socket) {
      const playerName = prompt("Please enter your name.\nPlease no code injections such as \"${name}\"");
      const newSocket = io(serverURL);  // Adjust this URL to your server's
      setSocket(newSocket);
      setPlayerData({ name: playerName });  // Store the player's name in state

      newSocket.on('connect', () => {
        newSocket.emit('joinLobby', playerName);

      });

      newSocket.on('joinRejected', (message) => {
        newSocket.disconnect();
        setSocket(null);
      });

      newSocket.on('joinAccepted', (message) =>{
        console.log('player ' + playerData + ' got refreshed');
        console.log(`Connected with ID: ${newSocket.id}` + ' name: ' + playerName);
        alert(message);
        setInLobby(true);
      })

    }
  };

  const toggleLeaderBoard = () => {

    console.log('in leaderboard');
    //make a socket connection to server
    const newSocket = io(serverURL);  // Adjust this URL to your server's
    setSocket(newSocket);
    //emit toggleLeaderBoard
    newSocket.on('connect', () => {
        newSocket.emit('toggleLeaderBoard');
        console.log('emitted toggleLeaderBoard');
    });
    // on.leaderboardUpdate - > change the html???
    newSocket.on('leaderBoardUpdate', (leaderboard) => {
      console.log('received leaderboard update');
      setLeaderBoard(leaderboard);
      console.log(leaderboard);
      setTimeout(() => {
        setShowLeaderboard(!showLeaderboard);
        newSocket.disconnect();
        setSocket(null);
        console.log(leaderboard);
      }, 0);

    });

  };

  const startGameManually = () => {
    if (socket && lobbyCount > 1 && !gameStarted) {  // Ensure there is at least 1 player
      console.log('CALLING SERVER TO START');
      socket.emit('startGameManually');  // Emit an event to the server to start the game manually
      setGameStarted(true);
      setInLobby(false);
      setGameWon(false);  // Ensure win state is reset when starting a new game
      setPlayerData({name: playerData.name});
    }
  };

  const handlePlayerWin = (name, timeTaken, jumpsTaken) => {
    console.log('Player ' + name + ' won.');
    const winnerData = { name, timeTaken, jumpsTaken };
    console.log('emitting playerWin');
    socket.emit('playerWin', winnerData);

  };

  const backToStart = () => {
    setGameStarted(false);
    setGameWon(false);
    setInLobby(false);
    setPlayerData({});
    socket.emit('leaveGame');
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  //sets up an individual camera
  const setupCamera = async () => {
    console.log('Selected Camera ID:', selectedCameraId);
    if (!selectedCameraId) {
        console.error('No camera selected.');
        return;
    }
    try {
        const constraints = {
            video: {
                deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
                width: { ideal: 200 },  // Ideal video width
                height: { ideal: 200 }  // Ideal video height
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(err => {
            console.error('Error auto-playing video:', err);
          });
        }

        // Optional: Set state if stream needs to be accessible elsewhere
        setCamera(stream);

        const loop = async () => {
            // Placeholder for any animation frame updates
            window.requestAnimationFrame(loop);
        };

        window.requestAnimationFrame(loop);
    } catch (error) {
        console.error('Camera setup failed:', error);
    }
};

// Fetch camera options on mount
useEffect(() => {
    const fetchCameraOptions = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(device => device.kind === 'videoinput');
            const options = videoInputs.map((device, index) => ({
                value: device.deviceId,
                label: device.label || `Camera ${index + 1}`
            }));
            setCameraOptions(options);
            if (options.length > 0) {
              setSelectedCameraId(options[0].value);  // Auto-select the first camera
            }
        } catch (err) {
            console.error('Failed to load camera options:', err);
        }
    };

    // Get permission to access camera and microphone first
    navigator.mediaDevices.getUserMedia({ video: true})
      .then(() => {
        fetchCameraOptions();  // Fetch cameras only after permissions are granted
      })
      .catch(err => {
        console.error('Access denied for camera: ', err);
      });
}, []);


  useEffect(() => {
    async function loadTMModel() {
      const URL = 'game_model/model.json';
      const metadataURL = 'game_model/metadata.json';
      try {
        const model = await tmPose.load(URL, metadataURL);
        setMaxPred(model.getTotalClasses());
        setModel(model);
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    }

    loadTMModel();

    return () => {
      // Cleanup code
    };
  }, []);



  // Function to predict poses using the loaded model
  const predictPoses = async () => {
    //console.log(model!=null && camera!=null);
    if (model!=null && camera!=null) {
      //console.log(model);
      try {
        const videoElement = videoRef.current;
        //console.log(videoElement.readyState);
        if (videoElement && videoElement.readyState === 4) { // Ensures the video is ready to capture frames
          const { pose, posenetOutput } = await model.estimatePose(videoElement); // Using videoElement directly
          const prediction = await model.predict(posenetOutput);
  
          prediction.sort((a, b) => b.probability - a.probability);
          //console.log('Predictions', prediction[0], ' ', prediction[1], ' ', prediction[2], ' ', prediction[3]);
          
          return prediction[0].className;
          // if(prediction[0].className!= undefined)
          // {
          //   console.log(prediction[0].className);
          // }
          

        }
      } catch (error) {
        console.error('Error in predicting poses:', error);
        return null;
      }
      return null;
    }
  };
  

  useEffect(() => {
    if (socket) {

      socket.on('gameWon', (winnerData) => {

        console.log('received gameWon from ' + winnerData.name);
        setWinnerData(winnerData);
        setGameWon(true);       // Show win screen
        setGameStarted(false); // Or manage another state to show the win screen
        console.log('gameWon ' + gameWon);
        console.log('gameStarted ' + gameStarted);
      });

      socket.on('lobbyUpdate', data => {
        setLobbyCount(data.count);
        setPlayersInLobby(data.players);

      });

      socket.on('startGame', () => {
        console.log('Game is starting!');
        setGameStarted(true);
        setInLobby(false);
        setGameWon(false);  // Ensure win state is reset when starting a new game
        setPlayerData({name: playerData.name});
      });
      socket.on('mainMenu', () => {
        console.log('Going back to main menu');
        setWinnerData(null);
        backToStart();
      });

      socket.on('leaderBoardUpdate', (leaderboard) =>
      {
        setLeaderBoard(leaderboard);
      });

      return () => {
        socket.off('lobbyUpdate');
        socket.off('startGame');
        socket.off('gameWon');
        socket.off('updateCountdown');
        socket.off('mainMenu');
        socket.off('leaderBoardUpdate');
      };
    }
  }, [socket]);

  return (
    <div className="app-container">
      <video ref={videoRef} width="200" height="200" autoPlay playsInline style={{ display: gameStarted ? "block" : "none" }}></video>
      {!gameStarted && !gameWon && !inLobby ? (
        <div>
          <h1>Welcome to HopKing</h1>
          <button className="start-button" onClick={joinLobby}>Join Lobby</button>
          <button className="start-button" onClick={toggleLeaderBoard}>View Leaderboard</button>
          {showLeaderboard && (
            <div className="leaderboard-popup">
              <h2>Leaderboard</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Score</th>
                      <th>Wins</th>
                      <th>Jumps</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(leaderboard).map(([key, value]) => (
                      <tr key={key}>
                        <td>{value[0]}</td>
                        <td>{value[1]}</td>
                        <td>{value[4]}</td>
                        <td>{value[3]}</td>
                        <td>{value[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={toggleLeaderBoard}>Close</button>
            </div>
          )}
        </div>

      ) : inLobby ? (
        <div>
          {/* add camera dropdown here */}
          <h2>Waiting Room</h2>
          <p>Players in lobby: {lobbyCount}</p>
          {playersInLobby.map(player => <p key={player}>{player}</p>)}
          {lobbyCount > 1 && <button className="start-button" onClick={startGameManually}>Start Game</button>}
          <button className="start-button" onClick={backToStart}>Back to Start</button><br></br>

          <label htmlFor="cameraList">Select Camera:</label>
          <select id="cameraList" value={selectedCameraId} onChange={(e) => setSelectedCameraId(e.target.value)}>
            {cameraOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <button className="startCamera" onClick={setupCamera} >Start Selected Camera</button>
          
          <canvas id="canvas" width="200" height="200"></canvas>

        </div>
      ) : gameWon ? (
        <div className="win-screen">
          <p>Player {winnerData.name} won! Time Taken: {winnerData.timeTaken} seconds with {winnerData.jumpsTaken} jumps.</p>

          <button className="start-button" onClick={backToStart}>Back to Start</button>
        </div>
      ) : (
        /* Show camera feed in small window */
        <PixiGame onPlayerWin={handlePlayerWin} startGame={gameStarted} playerName={playerData.name} model={model} camera={camera} videoRef={videoRef}/>
        
      )}
    </div>
  );
};

export default App;
