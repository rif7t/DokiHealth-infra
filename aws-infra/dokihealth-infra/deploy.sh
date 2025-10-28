#!/bin/bash

set -e

echo "Starting Terraform Initialization..."
terraform init -upgrade=false

echo "Validating Terraform Configuration..."
terraform validate 

echo "Planning Infrastructure..."
terraform plan -out=tfplan

echo "Applying Changes.."
terraform apply -auto-approve tfplan
