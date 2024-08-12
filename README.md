
# Qdrant GitOps SaaS DB Management PoC

## Introduction

The objective of this repository is to create a SaaS Database Management Proof of Concept (PoC) for Qdrant databases. This solution is designed to allow multiple clients to manage their Qdrant instances through a well-integrated system comprising a frontend interface, an API, and a GitOps workflow using Argo CD.

### How It Works

This solution employs a three-tier architecture:

- **Frontend**: Provides a user interface for clients to manage their Qdrant instances.
- **API**: Acts as a middle layer, validating JWT tokens, processing client requests, and committing changes to a Git repository.
- **GitOps (Argo CD)**: Automatically deploys and maintains Qdrant instances based on the changes committed to the Git repository.

![Flow](images/qdraw-flow.png)

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

![JWT Flow](images/jwt-flow.png)



**Benefits**:
- **Automation**: The entire process is automated, reducing the need for manual intervention.
- **Security**: Scoped JWT tokens ensure that clients can only manage their own resources.
- **Scalability**: The GitOps approach allows for easy scaling of the solution to manage multiple clients.

### Deployment with Kustomize and Argo CD

This section explains how Kustomize and Argo CD are used for deployment.

- **Kustomize**: Templates and customizations for different environments are managed using Kustomize.
- **Argo CD**: Handles the continuous deployment of the infrastructure by monitoring the Git repository and applying the necessary changes.

- **Deployment Configuration**: Kustomize and Argo CD configurations can be found in the following files:
  - [Argo CD App Configuration](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/argo-cd/app.yaml)
  - [Kustomize Base](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/argo-cd/applications/kustomize/base/kustomization.yaml)

### Managing Qdrant Helm Charts with Argo CD

Argo CD is also used to manage the Helm charts for each client's Qdrant instance. When a client configures their instance through the UI, the API commits the Helm values to the Git repository, and Argo CD ensures that the changes are applied to the Kubernetes cluster.

- **Helm Chart Management Code**:
  - [Helm Chart Management](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/argo-cd/applications/kustomize/argo.yaml)

### RBAC and API Security

The API uses RBAC (Role-Based Access Control) to manage permissions. It ensures that only authorized clients can access certain resources and perform specific actions. The API also manages secrets, such as API keys, and validates JWT tokens.

- **RBAC Configuration**:
  - [RBAC Config](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/argo-cd/clients.yaml)
- **API Key Management**:
  - [API Key Management](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/source/api/index.js#L59)
- **JWT Validation**:
  - [JWT Validation](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/source/api/index.js#L43)

### OpenID and Auth0 Integration

In addition to JWT, the solution also supports OpenID and Auth0 for authentication and authorization. This section explains how OpenID and Auth0 are integrated into the system, providing an alternative to JWT.

- **OpenID/Auth0 Integration Code**:
  - [OpenID/Auth0 Integration](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/source/api/auth.js)

### Terraform Deployment

The Terraform code in the repository handles the installation of Argo CD, Kong, and NGINX Ingress. This section explains the Terraform configuration, how to run it, and what it accomplishes.

- **Terraform Configuration**:
  - [Terraform Config](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/terraform/main.tf)
- **Running Terraform**: 
  - Initialize and apply with: `terraform init && terraform apply`

### Dockerfile and Features

The Dockerfile in the repository is designed with multi-stage builds for security and efficiency. It also includes Docker layer caching to speed up builds and supports multi-staging environments.

- **Dockerfile**:
  - [Dockerfile](https://github.com/morettimaxi/qdrant-gitops/blob/fe4e21ae102843c49531c8c8e2a8403ad50c8dcc/source/docker/Dockerfile)
- **Multi-Staging and Security**: The Dockerfile ensures that only the necessary dependencies are included in the final image, reducing the attack surface.
- **Docker Layer Caching**: Speeds up the build process by caching intermediate layers.
- **Version Management with Argo CD**: Argo CD updates the deployment version by overriding configurations based on the Docker image tags.

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
2. **JWT Signing Key Management**: Use Vault to manage JWT signing keys, implementing automatic key rotation. Ensure that old keys remain visible during rotation to avoid issues.

