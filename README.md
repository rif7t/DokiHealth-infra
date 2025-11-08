
DokiHealth Infrastructure
Overview

This repository contains the modular Terraform infrastructure for DokiHealth, automating the provisioning and deployment of servers, containerized services, and CI/CD pipelines with integrated security and observability. The design emphasizes scalability, maintainability, and operational clarity, making it suitable for production-grade deployments on AWS.

The infrastructure is organized in a modular and environment-driven structure, enabling rapid iteration, isolated testing, and consistent deployment across environments.

Key Features

Modular Terraform Architecture
Every component of the infrastructure is encapsulated as a Terraform module. This design enables reusability, independent updates, and clear separation of concerns.

CI/CD Integration
The repository includes pipeline configurations and automation scripts, enabling continuous deployment and operational consistency.

Security by Design
Security is integrated at every layer, including IAM roles and policies, network isolation, internal vs. internet-facing security groups, and NAT gateways for private subnets.

Observability & Monitoring
CloudWatch dashboards and log groups provide centralized metrics and logs for all resources, supporting proactive monitoring.

AWS Best Practices
Implements production-ready patterns for VPCs, subnets, load balancers, ECS services, NATs, and S3 storage, ensuring high availability and scalability.

Repository Structure
DokiHealth-infra/
├── .github/                 # GitHub workflows and actions
├── aws-infra/               # Core AWS infrastructure configs
├── ci-cd test/              # CI/CD pipeline test configs
├── envs/
│   └── prod/                # Production-specific environment variables and configurations
├── modules/                 # Reusable Terraform modules
│   ├── acm/
│   ├── alb-s3-bucket-policy/
│   ├── cloud-watch-log-group/
│   ├── cloudwatch-dashboard/
│   ├── ecs_cluster/
│   ├── eip/
│   ├── fargate-task-definitions/
│   ├── iam/
│   ├── igw/
│   ├── internal-security-group/
│   ├── internet-facing-security-group/
│   ├── lb-target-group-attachment/
│   ├── load-balancer-listener/
│   ├── load-balancer/
│   ├── nat-gateway/
│   ├── policy-document/
│   ├── priv-route-tables-association/
│   ├── private-route-table/
│   ├── pub-route-tables-association/
│   ├── public-route-table/
│   ├── s3/
│   ├── services/
│   ├── subnets/
│   ├── target-group/
│   └── vpc/
├── main.tf                  # Root Terraform configuration
├── variables.tf             # Input variables
├── outputs.tf               # Terraform outputs
├── tfplan                   # Example Terraform plan
├── deploy.sh                # Deployment automation script
├── docker-compose.yml       # Local container orchestration/testing
├── meditrust-ng-web/        # Example containerized service
└── supabase/                # Managed database / backend services

Modules Overview

Each module encapsulates a specific resource or set of related resources, enabling independent testing, reuse, and clear separation of concerns:

acm: AWS Certificate Manager certificates

alb-s3-bucket-policy: S3 bucket policies for ALB logging

cloud-watch-log-group: Centralized log groups for monitoring

cloudwatch-dashboard: Dashboards for operational metrics

ecs_cluster: ECS clusters for container orchestration

eip: Elastic IP allocation for public resources

fargate-task-definitions: ECS Fargate task definitions

iam: Roles, policies, and service accounts

igw: Internet gateway creation and attachment

internal-security-group & internet-facing-security-group: Network isolation

lb-target-group-attachment, load-balancer-listener, load-balancer, target-group: ALB and target routing

nat-gateway: NAT gateways for private subnet access

policy-document: Reusable IAM policies

private/public-route-tables & associations: Network routing

s3: Storage, backups, and logging buckets

services: ECS or other AWS services within VPC

subnets & vpc: Networking foundations

System Architecture

The DokiHealth infrastructure is designed around a multi-layer AWS architecture with clear separation between public-facing services, internal services, and data storage:

Networking Layer

VPC spans multiple availability zones

Public and private subnets for isolation

Internet Gateway for public access and NAT Gateways for outbound internet from private subnets

Route tables and associations manage traffic flow

Security Layer

IAM roles and policies enforce least-privilege access

Security groups differentiate between internal and internet-facing traffic

Policy documents allow standardized, reusable security policies across services

Compute Layer

ECS clusters running Fargate tasks for containerized services

Elastic IPs for stable public endpoints

ALBs and listeners handle traffic routing and target association

Storage Layer

S3 buckets for logging, backups, and persistent data

Integration with CloudWatch for centralized logging

Observability & Monitoring

CloudWatch dashboards visualize performance metrics

Log groups capture ECS and infrastructure logs

Supports automated alerting and proactive monitoring

CI/CD Integration

Pipelines and deployment scripts enable fully automated provisioning and updates

Changes in Terraform modules or environment configurations can be applied consistently across dev and prod environments

Diagram (simplified view):

           Internet
               |
           ALB (public)
         /           \
   Public Subnets   Private Subnets
   ECS Fargate        ECS Fargate
   Services           Services
       |                |
      NAT             Database / S3
      Gateway           (Storage & Logging)
       |
   Internet Access for Private Services

This architecture ensures scalability, security, and modularity, while providing full observability and seamless CI/CD integration.

Highlights

Modularity: Each Terraform module can evolve independently without impacting other components

Security: Least-privilege IAM, internal/external SGs, and controlled subnet access

Observability: CloudWatch dashboards and logs integrated across services

CI/CD Ready: Automation scripts and pipeline configs support continuous deployment

Scalable & Maintainable: Multi-AZ VPC design, ECS orchestration, and reusable modules

Outcome

This repository demonstrates production-grade, modular AWS infrastructure with a focus on automation, security, and observability, providing a solid foundation for a modern healthcare platform.
