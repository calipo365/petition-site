import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Petitions from "./components/Petitions";
import Petition from "./components/Petition";
import Register from "./components/Register";
import Login from "./components/Login";
import Create from "./components/Create";

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
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
