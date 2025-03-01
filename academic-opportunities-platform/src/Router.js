import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';
import PostOpportunityPage from './pages/PostOpportunityPage';
import OpportunityListPage from './pages/OpportunityListPage';
import EditOpportunityPage from './pages/EditOpportunityPage';
import SearchPage from './pages/SearchPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ApplicationsByOppPage from './pages/ApplicationsByOppPage';
import ApplicationsByUserPage from './pages/ApplicationsByUserPage';
import ConversationsPage from './pages/ConversationsPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppRouter() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/post-opportunity"
          element={
            <ProtectedRoute>
              <PostOpportunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <OpportunityListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities/edit/:id"
          element={
            <ProtectedRoute>
              <EditOpportunityPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/opportunities/:opportunityID" element={<OpportunityDetailPage />} />
        <Route path="/opportunities/:opportunityID/apply" element={<ApplicationFormPage />} />
        <Route path="/opportunities/:id/applications" element={<ApplicationsByOppPage />} />
        <Route path="/my-applications" element={<ApplicationsByUserPage />} />
        <Route path="/conversations" element={<ConversationsPage />} /> 
        <Route path="/conversations/:conversationID" element={<ChatPage />} /> 
      </Routes>
    </Router>
  );
}

export default AppRouter;
