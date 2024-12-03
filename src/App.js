import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AttendeeProvider } from './AttendeeContext';
import { PhotoProvider } from './PhotoContext';
import Navigation from './components/Navigation';
import SearchBar from './components/SearchBar';
import AttendeeTable from './components/AttendeeTable';
import DetailView from './components/DetailView';
import PhotoSessionsPage from './components/PhotoSessionsPage';

function App() {
  return (
    <AttendeeProvider>
      <PhotoProvider>
        <Router>
          <Routes>
            {/* Landing page route */}
            <Route 
              path="/landing" 
              element={
                <div className="min-h-screen bg-gray-100">
                  <SearchBar />
                  <div className="container mx-auto px-4 pt-32">
                    <AttendeeTable />
                  </div>
                </div>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/" 
              element={
                <div className="min-h-screen bg-gray-100">
                  <SearchBar />
                  <Navigation />
                  <div className="container mx-auto px-4 pt-32">
                    <AttendeeTable />
                    <DetailView />
                  </div>
                </div>
              } 
            />
            <Route 
              path="/photo-sessions" 
              element={<PhotoSessionsPage />} 
            />
          </Routes>
        </Router>
      </PhotoProvider>
    </AttendeeProvider>
  );
}

export default App;
