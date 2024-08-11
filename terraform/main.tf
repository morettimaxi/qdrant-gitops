

##############################
# NGINX Ingress Deployment
##############################

resource "helm_release" "nginx_ingress" {
  name             = "nginx-ingress"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  version          = var.nginx_ingress.chart_version
  namespace        = var.nginx_ingress.namespace
  create_namespace = true

  # Customize values as needed
  values = [
    <<EOF
controller:
  service:
    type: LoadBalancer
EOF
  ]
}

##############################
# Kong Deployment
##############################

resource "helm_release" "kong" {
  name             = "kong"
  repository       = "https://charts.konghq.com"
  chart            = "kong"
  version          = var.kong.chart_version
  namespace        = var.kong.namespace
  create_namespace = true

  # Customize values as needed
  values = [
    <<EOF
ingressController:
  installCRDs: false
EOF
  ]

  depends_on = [
    helm_release.nginx_ingress
  ]
}

##############################
# Argo CD Deployment
##############################

resource "helm_release" "argocd" {
  name             = "argo-cd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.argocd.chart_version
  namespace        = var.argocd.namespace
  create_namespace = true

  # Customize values as needed
  values = [
    <<EOF
server:
  service:
    type: LoadBalancer
EOF
  ]

  depends_on = [
    helm_release.kong
  ]
}
