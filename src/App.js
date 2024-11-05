import React from 'react';
import { AttendeeProvider } from './AttendeeContext';
import SearchBar from './components/SearchBar';
import AttendeeTable from './components/AttendeeTable';
import DetailView from './components/DetailView';

function App() {
  return (
    <AttendeeProvider>
      <div className="min-h-screen bg-gray-100">
        <SearchBar />
        <AttendeeTable />
        <DetailView />
      </div>
    </AttendeeProvider>
  );
}

export default App;