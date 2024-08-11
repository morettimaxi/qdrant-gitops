const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const k8s = require('@kubernetes/client-node');
const { Octokit } = require("@octokit/rest");
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// Middleware to validate tokens issued by Auth0
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// Function to initialize Octokit with the GitHub token
async function getOctokit() {
    const token = process.env.GITHUB_TOKEN; // Read the token from the environment variable
    if (!token) {
        throw new Error("GitHub token is not set in the environment variables.");
    }
    return new Octokit({ auth: token });
}

// Health check endpoint
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// Protected route to configure the number of replicas for a client
app.post('/configure', checkJwt, async (req, res) => {
    const { client, replicas } = req.body;

    // Check if the user has access to the client
    const userScope = req.user && req.user.scope;
    if (!userScope || (userScope !== client && userScope !== 'admin')) {
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

// Protected route to retrieve the token for a client
app.get('/token/:client', checkJwt, async (req, res) => {
    const { client } = req.params;

    const userScope = req.user && req.user.scope;
    if (!userScope || (userScope !== client && userScope !== 'admin')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }

    try {
        const secretName = `qdrant-${client}-apikey`;
        const namespace = `qdrant-${client}`;

        // Fetch the secret from Kubernetes
        const secret = await k8sApi.readNamespacedSecret(secretName, namespace);

        // Check if the api-key field exists in the secret's data
        if (!secret.body.data || !secret.body.data['api-key']) {
            return res.status(500).send({ error: 'API key not found in secret' });
        }

        // Decode the api-key from base64
        const apiKey = Buffer.from(secret.body.data['api-key'], 'base64').toString();

        res.send({ token: apiKey });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to retrieve token' });
    }
});

app.listen(8081, () => {
    console.log('API server running on port 8081');
});
