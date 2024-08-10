const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const k8s = require('@kubernetes/client-node');
const { Octokit } = require("@octokit/rest");

const app = express();
const SECRET_KEY = 'test1234'; // TODO auto rotation using vault or other secret manager

app.use(cors());
app.use(bodyParser.json());

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const users = { //TODO use auth0 or other auth service
    client1: { password: 'client1', scope: 'client1' },
    client2: { password: 'client2', scope: 'client2' },
    admin: { password: 'admin', scope: 'admin' }  // Admin user with all access
};

// Function to initialize Octokit with the GitHub token
async function getOctokit() {
    const token = process.env.GITHUB_TOKEN; // Read the token from the environment variable
    if (!token) {
        throw new Error("GitHub token is not set in the environment variables.");
    }
    return new Octokit({ auth: token });
}

// Login endpoint to authenticate users and issue JWT token
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username].password === password) {
        const token = jwt.sign({ username, scope: users[username].scope }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
});

// Middleware to validate JWT token and extract user info
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

// Endpoint to configure the number of replicas for a client
app.post('/configure', authenticateToken, async (req, res) => {
    const { client, replicas } = req.body;

    // Check if the user has access to the client
    if (req.user.scope !== client && req.user.scope !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }

    try {
        const octokit = await getOctokit();

        const { data: { content, sha } } = await octokit.repos.getContent({
            owner: 'morettimaxi',
            repo: 'qdrant-gitops',
            path: `argo-cd/clients/helm/${client}/values.yaml`,
            ref: 'master'
        });

        let valuesContent = Buffer.from(content, 'base64').toString();
        valuesContent = valuesContent.replace(/replicaCount:.*/, `replicaCount: ${replicas}`);

        await octokit.repos.createOrUpdateFileContents({
            owner: 'morettimaxi',
            repo: 'qdrant-gitops',
            path: `argo-cd/clients/helm/${client}/values.yaml`,
            message: `Update replicas for ${client}`,
            content: Buffer.from(valuesContent).toString('base64'),
            sha,
            branch: 'master'
        });

        res.send({ status: 'Replicas updated and pushed to GitHub' });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to update replicas' });
    }
});

// Endpoint to retrieve the token for a client
app.get('/token/:client', authenticateToken, async (req, res) => {
    const { client } = req.params;

    // Check if the user has the necessary permissions
    if (req.user.scope !== client && req.user.scope !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }

    try {
        // Construct the secret name and namespace dynamically
        const secretName = `qdrant-${client}-apikey`;
        const namespace = `qdrant-${client}`;

        // Fetch the secret from Kubernetes
        const secret = await k8sApi.readNamespacedSecret(secretName, namespace);

        // Decode the token from the secret
        const token = Buffer.from(secret.body.data.token, 'base64').toString();
        
        // Send the token in the response
        res.send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to retrieve token' });
    }
});


app.listen(8081, () => {
    console.log('API server running on port 8081');
});
