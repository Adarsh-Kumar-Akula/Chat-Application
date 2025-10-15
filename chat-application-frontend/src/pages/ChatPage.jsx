import React, { useState, useEffect, useRef } from "react";
import FriendDialog from "../components/FriendDialog";

function ChatPage() {
  const [loggedInUsername] = useState(
    localStorage.getItem("loggedInUsername") || ""
  );
  const [selectedUsername, setSelectedUsername] = useState(
    localStorage.getItem("selectedUsername") || ""
  );

  const [showDialog, setShowDialog] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save selected user to localStorage
  useEffect(() => {
    if (selectedUsername) {
      localStorage.setItem("selectedUsername", selectedUsername);
    }
  }, [selectedUsername]);

  // Fetch friends list
  useEffect(() => {
    if (!loggedInUsername) return;

    const fetchFriends = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/friends/list/?username=${loggedInUsername}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setContacts(data.friends || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [loggedInUsername]);

  // WebSocket Connection - Always open for logged-in user
  useEffect(() => {
    if (!loggedInUsername) return;

    // Connect to WebSocket
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/?username=${loggedInUsername}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✓ WebSocket Connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received from WebSocket:", data);

      // Handle connection established
      if (data.type === "connection_established") {
        console.log(`✓ Connected as ${data.username}`);
        return;
      }

      // Handle errors
      if (data.type === "error") {
        console.error("WebSocket error:", data.error);
        alert(data.error);
        return;
      }

      // Handle incoming message
      if (data.type === "new_message") {
        const newMessage = {
          id: data.message_id,
          sender_username: data.sender_username,
          receiver_username: data.receiver_username,
          text: data.message,
          timestamp: data.timestamp,
        };

        // Only add message if it's part of the current conversation
        // Check if sender is the selected user OR if we sent it to selected user
        if (
          data.sender_username === selectedUsername ||
          data.receiver_username === selectedUsername
        ) {
          setMessages((prevMessages) => {
            // Check if message already exists (prevent duplicates)
            const exists = prevMessages.some((msg) => msg.id === newMessage.id);
            if (exists) return prevMessages;
            return [...prevMessages, newMessage];
          });
        } else {
          // Message from someone else - you could show a notification here
          console.log(`New message from ${data.sender_username} (not currently selected)`);
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("✗ WebSocket Disconnected");
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [loggedInUsername, selectedUsername]);

  // Fetch chat history when selected user changes
  useEffect(() => {
    if (!selectedUsername || !loggedInUsername) {
      setMessages([]); // Clear messages if no user selected
      return;
    }

    const fetchChatHistory = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/chat/history/${loggedInUsername}/${selectedUsername}/`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform data to match our message format
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          sender_username: msg.sender_username,
          receiver_username: msg.receiver_username,
          text: msg.content,
          timestamp: msg.timestamp,
        }));

        setMessages(formattedMessages);
        console.log(`✓ Loaded ${formattedMessages.length} messages with ${selectedUsername}`);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setMessages([]);
      }
    };

    fetchChatHistory();
  }, [selectedUsername, loggedInUsername]);

  // Handle sending message
  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUsername) return;

    if (!isConnected || !wsRef.current) {
      alert("WebSocket not connected. Please refresh the page.");
      return;
    }

    // Send message via WebSocket
    const messageData = {
      message: message.trim(),
      receiver_username: selectedUsername,
    };

    console.log("Sending message:", messageData);
    wsRef.current.send(JSON.stringify(messageData));
    setMessage("");
  };

  const handleFriendAdded = async (friendUsername) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/friends/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loggedInUsername,
          friend_username: friendUsername,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setContacts((prevContacts) => [...prevContacts, friendUsername]);
        setShowDialog(false);
        alert(data.message || `You are now friends with ${friendUsername}`);
      } else {
        alert(data.error || "Failed to add friend.");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("An error occurred while adding the friend.");
    }
  };

  const handleLogout = async () => {
  try {
    // Call backend logout API
    await fetch("http://127.0.0.1:8000/accounts/logout/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // if using sessions/cookies
    });

    // Remove username from localStorage
    localStorage.removeItem("loggedInUsername");

    // Redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow-md flex-shrink-0"> 
        <button
          onClick={() => setShowDialog(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Friend
        </button>

        <div className="relative">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={isConnected ? "Connected" : "Disconnected"}
          ></div>
          <span className="text-gray-700 font-medium">
            {loggedInUsername || "Guest"}
          </span>
        </div>

    {/* Dropdown Menu */}
    {showDropdown && (
      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Logout
        </button>
      </div>
    )}
    </div>
  </div>


      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Contacts Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 font-semibold text-gray-700 flex-shrink-0">
            Contacts
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {contacts.map((contact) => (
              <div
                key={contact}
                onClick={() => setSelectedUsername(contact)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedUsername === contact
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
                <span
                  className={
                    selectedUsername === contact
                      ? "text-blue-600 font-medium"
                      : "text-gray-700"
                  }
                >
                  {contact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedUsername
                ? `Chat with ${selectedUsername}`
                : "Select a contact"}
            </h2>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
            {messages.length === 0 && selectedUsername && (
              <div className="text-center text-gray-500 mt-8">
                No messages yet. Start the conversation!
              </div>
            )}
            {messages.map((msg) =>
              msg.sender_username === loggedInUsername ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-md break-words">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex justify-start">
                  <div className="bg-white text-gray-800 px-4 py-2 rounded-lg max-w-md shadow-sm break-words">
                    {msg.text}
                  </div>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  selectedUsername
                    ? "Enter Message"
                    : "Select a contact first"
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                disabled={!selectedUsername || !isConnected}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!selectedUsername || !isConnected}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Friend Dialog Modal */}
      {showDialog && (
        <FriendDialog
          onClose={() => setShowDialog(false)}
          onFriendAdded={handleFriendAdded}
        />
      )}
    </div>
  );
}

export default ChatPage;