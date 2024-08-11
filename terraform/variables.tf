##############################
# Variables Declaration
##############################

variable "kubeconfig_path" {
  description = "Path to the kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context_name" {
  description = "Kubernetes context name to use"
  type        = string
  default     = "docker-desktop" # Replace with your context name
}

variable "nginx_ingress" {
  description = "Configuration for NGINX Ingress"
  type = object({
    namespace     = string
    chart_version = string
  })
  default = {
    namespace     = "ingress-nginx"
    chart_version = "4.11.1"
  }
}

variable "kong" {
  description = "Configuration for Kong"
  type = object({
    namespace     = string
    chart_version = string
  })
  default = {
    namespace     = "kong"
    chart_version = "2.15.0"
  }
}

variable "argocd" {
  description = "Configuration for Argo CD"
  type = object({
    namespace     = string
    chart_version = string
  })
  default = {
    namespace     = "argocd"
    chart_version = "5.46.4"
  }
}
