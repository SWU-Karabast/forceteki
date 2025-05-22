const io = require('socket.io-client');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to the socket server
console.log('Connecting to server...');
const socket = io('http://localhost:10000', {
  path: '/ws',
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

// Handle connection events
socket.on('connect', () => {
  console.log('Connected to server with socket ID:', socket.id);
  console.log('IP logging test - sending test chat message');
  
  // Join a lobby or create one (this depends on your server implementation)
  // For this test, we're assuming you'll create a lobby manually first
  
  // Ask for the lobby ID
  rl.question('Enter lobby ID (or press enter to skip): ', (lobbyId) => {
    if (lobbyId) {
      // Join the specified lobby
      socket.emit('joingame', lobbyId);
      console.log('Joining lobby:', lobbyId);
      
      // Send a test chat message after a short delay
      setTimeout(() => {
        console.log('Sending test chat message...');
        socket.emit('chat', 'This is a test message for IP logging');
        console.log('Test message sent. Check server logs for IP address.');
        
        // Close the connection after another short delay
        setTimeout(() => {
          socket.disconnect();
          rl.close();
        }, 2000);
      }, 2000);
    } else {
      console.log('No lobby ID provided. Test canceled.');
      socket.disconnect();
      rl.close();
    }
  });
});

// Handle errors
socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Handle server messages
socket.on('gamestate', (data) => {
  console.log('Received game state update');
});

// Exit handler
rl.on('close', () => {
  console.log('Test complete. Check server logs for IP address in chat message logs.');
  process.exit(0);
});