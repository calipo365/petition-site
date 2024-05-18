import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Petitions from "./components/Petitions";
import Petition from "./components/Petition";
import Register from "./components/Register";
import Login from "./components/Login";
import Create from "./components/Create";
import Profile from './components/Profile';
import Manage from './components/Manage';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Petitions/>}/>
            <Route path="/petitions/:id" element={<Petition/>}/>
            <Route path="/users/register" element={<Register/>}/>
            <Route path="/users/login" element={<Login/>}/>
            <Route path="/create" element={<Create/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/petitions/:id/manage" element={<Manage/>}/>
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
