# Qdrant GitOps SaaS DB Management PoC

## Introduction

The objective of this repository is to create a SaaS Database Management Proof of Concept (PoC) for Qdrant databases. This solution is designed to allow multiple clients to manage their Qdrant instances through a well-integrated system comprising a frontend interface, an API, and a GitOps workflow using Argo CD.

### How It Works

This solution employs a three-tier architecture that is meticulously designed to ensure scalability, security, and automation:

- **Frontend**: Provides a user-friendly interface where clients can log in, configure their Qdrant instances, and monitor status updates. The frontend is responsible for interacting with the user and securely transmitting data to the API.
  
- **API**: Serves as the intermediary between the frontend and backend systems. It is responsible for validating user credentials, generating and validating JWT tokens, processing client requests, and committing the necessary configuration changes to a Git repository. This layer ensures that all client interactions are secure and authorized.

- **GitOps (Argo CD)**: Continuously monitors the Git repository for changes and automatically deploys updates to the Qdrant instances. Argo CD ensures that the desired state of the infrastructure, as defined in the Git repository, is maintained consistently across all environments.

- **Link to Argo CD Configuration**: The apps (frontend and API) are configured in Argo CD, which ensures automated deployment and continuous integration.
  - [Argo CD App Configuration](https://github.com/morettimaxi/qdrant-gitops/blob/master/argo-cd/applications/kustomize/argo.yaml)

### JWT Configuration and Flow

The JWT (JSON Web Token) is configured to include specific scopes for each client. Upon client login, the token is validated against the defined scopes, ensuring that each client can only manage their own Qdrant instance. If the token's scope matches the client, the API processes the request, such as configuring replicas, and commits the changes to the GitOps repository. Argo CD then takes over, deploying and maintaining the infrastructure automatically.

- **JWT Validation Code**: The JWT validation is handled in the API.
  - [API JWT validation](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/source/api/index.js#L43)

### Flow Explanation

1. **Client Login**: The client logs in through the frontend, where their JWT token is validated.
2. **Scope Validation**: The API checks if the token's scope matches the client's permissions.
3. **Action Processing**: If valid, the client can perform actions like setting the number of replicas through the UI.
4. **GitOps Commit**: The API commits the client's changes to the GitOps repository.
5. **Argo CD Deployment**: Argo CD automatically deploys the changes, ensuring that the client's Qdrant instance is updated.

- **JWT Flow Diagram**:
![JWT Flow](images/jwt-flow.png)

**Benefits**:
- **Automation**: The entire process is automated, reducing the need for manual intervention.
- **Security**: Scoped JWT tokens ensure that clients can only manage their own resources.
- **Scalability**: The GitOps approach allows for easy scaling of the solution to manage multiple clients.

### Deployment with Kustomize and Argo CD

The deployment strategy leverages Kustomize and Argo CD to manage environment-specific configurations and ensure continuous delivery of the infrastructure.

- **Kustomize**: Manages environment-specific configurations through a layering approach, allowing for base configurations to be overridden by environment-specific settings.
- **Argo CD**: Handles the continuous deployment of the infrastructure by monitoring the Git repository and applying the necessary changes automatically.

- **Override and Kustomize Configuration**: The environment-specific settings and overrides are managed using Kustomize.
  - [Kustomize Overrides](https://github.com/morettimaxi/qdrant-gitops/blob/master/argo-cd/applications/kustomize/overlays/prod/kustomization.yaml)

### Kubernetes Features

The Kubernetes deployments are configured with several advanced features to ensure high availability, resilience, and optimal resource utilization:

- **Liveness Probes and Health Checks**: Ensure that the applications are running correctly and can recover from failures automatically.
- **Resource Limitations**: Set limits on CPU and memory usage to prevent any single application from consuming all available resources.
- **Horizontal Pod Autoscaler (HPA)**: Automatically scales the number of pods based on the current load, ensuring that the application can handle varying levels of traffic.
- **Pod Disruption Budget (PDB)**: Ensures that a minimum number of pods are always available during maintenance or updates.

These features enhance the reliability and efficiency of the deployments, ensuring that the system remains responsive and available under all conditions.

### Managing Qdrant Helm Charts with Argo CD

Argo CD is also used to manage the Helm charts for each client's Qdrant instance. The Helm charts are configured to deploy client-specific Qdrant instances with environment-specific values.

- **Helm Chart Management**:
  - [Helm Chart Configuration](https://github.com/morettimaxi/qdrant-gitops/blob/master/argo-cd/clients.yaml)

- **API Updates**: The API interacts with the Helm charts by updating the `values.yaml` files specific to each client. These updates are then automatically deployed by Argo CD.
  - [Client-specific Helm Values](https://github.com/morettimaxi/qdrant-gitops/blob/master/argo-cd/clients/helm/client1/values.yaml)

### RBAC and API Security

The API uses Role-Based Access Control (RBAC) to ensure that only authorized clients can access specific resources. RBAC policies are enforced at both the API and Kubernetes levels to ensure security and compliance.

- **RBAC Configuration**:
  - [RBAC Policy](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/argo-cd/clients.yaml)

- **API Key and JWT Management**: The API also manages API keys and JWT tokens, ensuring secure authentication and authorization for all client requests.
  - [API Key Management](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/source/api/index.js#L59)

### OpenID and Auth0 Integration

The solution also supports OpenID and Auth0 as alternative authentication mechanisms. These integrations provide enhanced security features, such as multi-factor authentication and centralized identity management.

- **OpenID/Auth0 Integration**:
  - [OpenID/Auth0 Configuration](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/source/api/auth.js)

### Terraform Deployment

The Terraform scripts in this repository are responsible for setting up the foundational infrastructure, including Argo CD, Kong, and NGINX Ingress. These scripts ensure that the environment is consistently configured and ready for application deployment.

- **Terraform Configuration**:
  - [Terraform Main Configuration](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/terraform/main.tf)

### Dockerfile and Features

The Dockerfile is designed to ensure security, efficiency, and scalability. It includes the following features:

- **Multi-Stage Builds**: The Dockerfile uses multi-stage builds to reduce the final image size and ensure that only necessary components are included in the production image.
- **Docker Layer Caching**: This feature speeds up the build process by caching intermediate layers, which is particularly useful during continuous integration and deployment (CI/CD) processes.
- **Security Considerations**: The Dockerfile is configured to minimize the attack surface by including only essential components and applying security best practices.

- **Dockerfile Configuration**:
  - [Dockerfile](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/source/docker/Dockerfile)

- **Version Management with Argo CD**: Argo CD manages the deployment versions by overriding configurations based on the Docker image tags, ensuring that updates are automatically applied without manual intervention.

### Comparison: OpenID vs. JWT

| Feature             | OpenID                                | JWT                                    |
|---------------------|---------------------------------------|----------------------------------------|
| **Authentication**  | Centralized via Auth0                 | Self-contained                         |
| **Authorization**   | Scopes and roles managed by Auth0     | Scopes included within the token       |
| **Security**        | Higher security with OAuth 2.0 flows  | Secure, but requires careful handling  |
| **Flexibility**     | More flexible with external providers | Simpler, but less flexible             |
| **Integration**     | Easier with existing IdPs             | Requires custom implementation         |
| **Performance**     | Potentially slower due to external calls | Fast, as it's self-contained        |

### Pending Tasks

1. **Terraform Backend**: Create a backend in S3 or another cloud bucket to store the Terraform state.
2. **JWT Signing Key Management**: Use Vault to manage JWT signing keys, implementing automatic key rotation. Ensure
