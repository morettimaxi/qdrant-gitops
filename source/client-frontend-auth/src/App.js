import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
    const { loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [replicas, setReplicas] = useState(1);
    const [persistenceSize, setPersistenceSize] = useState('15Gi');
    const [snapshotSize, setSnapshotSize] = useState('15Gi');
    const [client, setClient] = useState('');

    useEffect(() => {
        if (isAuthenticated && user) {
            setClient(user.nickname || user.name);  // Assuming nickname or name represents the client; adjust as necessary
        }
    }, [isAuthenticated, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch('http://api.local/configure', {
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
        } catch (error) {
            console.error('Error submitting configuration:', error);
            alert('Error submitting configuration');
        }
    };

    return (
        <div className="App">
            {!isAuthenticated ? (
                <div className="login-form">
                    <h2>Login</h2>
                    <button onClick={() => loginWithRedirect()}>Login with Auth0</button>
                </div>
            ) : (
                <div className="config-form">
                    <header>
                        <img src="logo_with_text.png" alt="Qdrant Logo" className="logo" />
                    </header>
                    <h2>Configure {client} Replicas</h2>
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
                        <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default App;
