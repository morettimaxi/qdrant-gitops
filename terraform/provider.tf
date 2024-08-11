##############################
# Providers Configuration
##############################

# Specify the required providers and their versions
terraform {
  required_version = ">= 0.13"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.13"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.5"
    }
  }
}

# Kubernetes Provider Configuration
provider "kubernetes" {
  config_path    = var.kubeconfig_path   # Path to your kubeconfig file
  config_context = var.kube_context_name # Kubernetes context to use
}

# Helm Provider Configuration
provider "helm" {
  kubernetes {
    config_path    = var.kubeconfig_path
    config_context = var.kube_context_name
  }
}
