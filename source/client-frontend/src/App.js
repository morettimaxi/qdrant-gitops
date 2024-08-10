import React, { useState } from 'react';
import './App.css';

function App() {
  const [client, setClient] = useState('client1');
  const [replicas, setReplicas] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('http://localhost:8081/configure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client, replicas }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.status);
    } else {
      alert('Failed to update replicas');
    }
  };

  return (
    <div className="App">
      <header>
        <img src="logo_with_text.png" alt="Qdrant Logo" className="logo" />
      </header>
      <h1>Configure Client Replicas</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Client:</label>
          <select value={client} onChange={(e) => setClient(e.target.value)}>
            <option value="client1">Client 1</option>
            <option value="client2">Client 2</option>
          </select>
        </div>
        <div>
          <label>Persistence Size:</label>
          <input type="text" value="15Gi" readOnly />
        </div>
        <div>
          <label>Snapshot Persistence Size:</label>
          <input type="text" value="15Gi" readOnly />
        </div>
        <div>
          <label>Replicas:</label>
          <input
            type="number"
            value={replicas}
            onChange={(e) => setReplicas(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
