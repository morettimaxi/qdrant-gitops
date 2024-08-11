
##############################
# Outputs
##############################

output "nginx_ingress_controller_service" {
  description = "Details of the NGINX Ingress Controller Service"
  value       = helm_release.nginx_ingress.status
}

output "kong_service" {
  description = "Details of the Kong Service"
  value       = helm_release.kong.status
}

output "argocd_server_service" {
  description = "Details of the Argo CD Server Service"
  value       = helm_release.argocd.status
}
