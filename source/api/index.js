const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // Import the cors package
const k8s = require('@kubernetes/client-node');
const { Octokit } = require("@octokit/rest");

const app = express();

// Use cors middleware to allow requests from any origin
app.use(cors());  
app.use(bodyParser.json());

// Initialize Kubernetes Client
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// Initialize Octokit with the GitHub token
async function getOctokit() {
    const token = ""; // Replace with your actual GitHub token
    return new Octokit({ auth: token });
}

// Endpoint to configure the number of replicas for a client
app.post('/configure', async (req, res) => {
  const { client, replicas } = req.body;
  
  try {
      const octokit = await getOctokit();

      // Get the current content of the values.yaml file
      const { data: { content, sha } } = await octokit.repos.getContent({
          owner: 'morettimaxi',
          repo: 'qdrant-gitops',
          path: `argo-cd/clients/overlays/${client}/values.yaml`,
          ref: 'master'
      });

      // Decode content and update only the replicas value
      let valuesContent = Buffer.from(content, 'base64').toString();
      valuesContent = valuesContent.replace(/replicas:.*/, `replicas: ${replicas}`);

      // Push the updated content back to GitHub
      await octokit.repos.createOrUpdateFileContents({
          owner: 'morettimaxi',
          repo: 'qdrant-gitops',
          path: `argo-cd/clients/overlays/${client}/values.yaml`,
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
app.get('/token/:client', async (req, res) => {
  const { client } = req.params;
  
  try {
      // Retrieve secret token from Kubernetes
      const secret = await k8sApi.readNamespacedSecret(`${client}-secret`, 'saas-app');
      const token = Buffer.from(secret.body.data.token, 'base64').toString();
      
      res.send({ token });
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to retrieve token' });
  }
});

app.listen(8081, () => {
  console.log('API server running on port 8081');
});
