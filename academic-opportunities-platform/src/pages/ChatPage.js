import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const ChatPage = () => {
  const { conversationID } = useParams();
  const [messages, setMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authorization required');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_MESSAGING_URL}/api/conversations/${conversationID}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setError('Failed to fetch messages');
      }
    };

    fetchMessages();
  }, [conversationID]);

  const handleSendMessage = async () => {
    const token = localStorage.getItem('token');
    if (!newMessage.trim()) return;
  
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_MESSAGING_URL}/api/conversations/${conversationID}/messages`, {
        senderID: jwtDecode(token).userId,
        messageContent: newMessage,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewMessage('');
      window.location.reload();
    } catch (error) {
      setError('Failed to send message');
    }
  };
  
  
  
  

  return (
    <div>
      <h1>Chat</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
        <ul>
        {messages.length > 0 ? (
        messages.map((message, index) => (
            <li key={index}>
                <strong>{message.SenderName || 'Unknown'}:</strong> {message.MessageContent}
            </li>
            ))
        ) : (
            <li>No messages yet.</li>
            )}
        </ul>

      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatPage;
