// src/App.js
import React from 'react';
import ApologyCard from './Cards/ApologyCard'; // Adjust path if needed
import './index.css'; // Import global styles/resets

function App() {
  return (
    // ApologyCard handles its own full-screen wrapper now
    <ApologyCard />
  );
}

export default App;