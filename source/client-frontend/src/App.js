import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState(null);
    const [scope, setScope] = useState('');
    const [client, setClient] = useState('');
    const [replicas, setReplicas] = useState(1);
    const [persistenceSize, setPersistenceSize] = useState('15Gi');
    const [snapshotSize, setSnapshotSize] = useState('15Gi');

    const handleLogin = async () => {
        const response = await fetch('http://localhost:8081/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);  // Store the token in localStorage
            setToken(data.token);
            const decoded = JSON.parse(atob(data.token.split('.')[1]));
            setScope(decoded.scope);
            setClient(decoded.scope);
        } else {
            alert(data.error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:8081/configure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            setToken(token);
            setScope(decoded.scope);
            setClient(decoded.scope);
        }
    }, []);

    return (
        <div className="App">
            {!token ? (
                <div className="login-form">
                    <h2>Login</h2>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin}>Login</button>
                </div>
            ) : (
                <div className="config-form">
                    <header>
                        <img src="logo_with_text.png" alt="Qdrant Logo" className="logo" />
                    </header>
                    <h2>Configure {scope} Replicas</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Client:</label>
                            <input type="text" value={client} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Persistence Size:</label>
                            <input type="text" value={persistenceSize} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Snapshot Persistence Size:</label>
                            <input type="text" value={snapshotSize} readOnly />
                        </div>
                        <div className="form-group">
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
            )}
        </div>
    );
}

export default App;
