// src/components/FriendDialog.jsx
import React, { useState } from 'react';

function FriendDialog({ onClose, onFriendAdded }) {
  const [friendUsername, setFriendUsername] = useState("");

  const handleAddFriend = () => {
    if (friendUsername.trim()) {
      onFriendAdded(friendUsername.trim());
      setFriendUsername("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddFriend();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Add a Friend</h3>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter friend's username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleAddFriend}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Friend
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-red-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default FriendDialog;