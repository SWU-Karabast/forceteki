# IP Logging for Chat Messages

This feature adds IP address logging to chat messages to help identify and ban abusive users.

## Implementation Details

When a user sends a chat message, their IP address is now logged along with the message content, user ID, username, and lobby ID. This information is included in the server logs.

## How to Use

1. Run the server as normal
2. When a user sends a chat message, their IP address will be included in the logs
3. To find abusive messages, search the logs for the timestamp or message content
4. Once found, you can see the IP address in the log entry and ban it if needed

## Testing the Feature

A test script is included to verify that IP logging is working correctly:

1. Start the server
2. Create a lobby through the normal client interface
3. Run the test script:
   ```
   node test/ip-logging-test.js
   ```
4. When prompted, enter the lobby ID
5. The script will send a test message
6. Check the server logs for an entry like:
   ```
   [info]: Lobby: user <username> sent chat message: This is a test message for IP logging { lobbyId: '<id>', userName: '<username>', userId: '<id>', ipAddress: '<ip>' }
   ```

## Log Format

The IP address is included in the log message metadata with the key `ipAddress`. When looking at the logs, you'll see entries like:

```
[timestamp] [info]: Lobby: user UserName sent chat message: Message content { lobbyId: 'abc123', userName: 'UserName', userId: 'user123', ipAddress: '192.168.1.1' }
```

## Implementation Notes

- IP addresses are extracted from the socket connection's handshake data
- If the IP address cannot be determined, it will be logged as "unknown"
- This feature only affects chat message logging and does not modify any game mechanics or user-facing functionality