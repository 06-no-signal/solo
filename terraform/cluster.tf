terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.90.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "adc362d6-4cb2-496a-864a-f1a2e488a99a"
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-aks-swedencentral"
  location = "swedencentral"
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "aks-swedencentral"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "aks-swedencentral"

  default_node_pool {
    name                = "system"
    vm_size             = "Standard_A2m_v2"
    type                = "VirtualMachineScaleSets"

    auto_scaling_enabled = true
    min_count           = 1
    max_count           = 5
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }
}

output "kube_config" {
  value     = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive = true
}
