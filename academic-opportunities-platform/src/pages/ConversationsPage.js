import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const ConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // To navigate to a conversation

  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authorization required');
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_MESSAGING_URL}/api/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConversations(response.data);
    } catch (error) {
      setError('Failed to fetch conversations');
    }
  };

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Function to handle creating a new conversation
  const handleCreateConversation = async (applicantID, opportunityID) => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_MESSAGING_URL}/api/conversations`, {
        opportunityID,
        applicantID,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { conversationID } = response.data;
      alert('Conversation created successfully!');
      navigate(`/conversations/${conversationID}`);
      fetchConversations();
    } catch (error) {
      alert('Failed to create conversation');
    }
  };

  return (
    <div>
      <h1>Your Conversations</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {conversations.length > 0 ? (
        <ul>
          {conversations.map((conv) => (
            <li key={conv.ConversationID}>
              <p>Opportunity ID: {conv.OpportunityID}</p>
              <p>Last Message: {conv.LastMessageTimestamp}</p>
              <Link to={`/conversations/${conv.ConversationID}`}>Open Chat</Link>
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>No conversations yet</p>
      )}
    </div>
  );
};

export default ConversationsPage;
