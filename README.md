![CI](https://img.shields.io/badge/ci-passing-brightgreen)
![Stack](https://img.shields.io/badge/stack-Python%20|%20Go%20|%20Docker%20|%20Terraform%20|%20AWS-blue)

# DokiHealth Infrastructure

DokiHealth Infrastructure is a **production-ready, modular AWS environment** built with Terraform, Docker, and ECS. It automates **provisioning, deployment, and observability** while maintaining **high security, scalability, and modularity**.

It is designed as a **fully automated infrastructure** to support containerized applications, CI/CD pipelines, and centralized monitoring.

---

## Features

| Area                          | Description                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| **Modular Terraform**         | Each resource or service is encapsulated in reusable modules for clarity and maintainability. |
| **CI/CD Integration**         | GitHub workflows automate Terraform deployments, ECS updates, and environment validation. |
| **Security**                  | IAM roles, policies, and segregated security groups enforce least-privilege and isolation. |
| **Observability**             | CloudWatch dashboards and log groups provide full visibility across services. |
| **Containerized Services**    | ECS Fargate tasks deploy services like `meditrust-ng-web` behind ALBs.     |
| **Environment Management**    | Supports multiple environments (prod/dev/staging) using environment-specific configurations. |
| **Storage & Backups**         | S3 buckets store logs, backups, and persistent application data.          |

---

## Architecture Overview

- **Networking Layer**
  - VPC spanning multiple availability zones
  - Public and private subnets with NAT Gateways
  - Route tables and associations for controlled traffic flow

- **Security Layer**
  - IAM roles and policies
  - Internal and internet-facing security groups
  - Reusable policy documents for consistent access control

- **Compute Layer**
  - ECS clusters running containerized services
  - ALBs for traffic routing and target group associations
  - Elastic IPs for stable public endpoints

- **Storage Layer**
  - S3 buckets for logs, backups, and persistent data
  - Integrated with CloudWatch for metrics and centralized logging

- **Observability & Monitoring**
  - CloudWatch dashboards for metrics visualization
  - Log groups capturing ECS and infrastructure logs

- **CI/CD Integration**
  - GitHub workflows and automation scripts for repeatable deployments
  - Environment-specific variables for production, staging, and development

**Simplified Diagram:**

```text
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


Modules Overview
| Module                                                                                  | Purpose                                           |
| --------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `vpc`, `subnets`                                                                        | Network foundations (VPC, public/private subnets) |
| `igw`, `nat-gateway`                                                                    | Internet access & secure outbound traffic         |
| `internal-security-group`, `internet-facing-security-group`                             | Segregated network security                       |
| `ecs_cluster`, `fargate-task-definitions`, `services`                                   | Container orchestration and ECS tasks             |
| `load-balancer`, `load-balancer-listener`, `lb-target-group-attachment`, `target-group` | Traffic routing and scaling                       |
| `s3`, `alb-s3-bucket-policy`                                                            | Storage, logging, backups                         |
| `cloud-watch-log-group`, `cloudwatch-dashboard`                                         | Observability and metrics                         |
| `iam`, `policy-document`                                                                | Access control and reusable IAM policies          |


Highlights

Production-Ready: Designed for AWS best practices with scalability, security, and observability.

Fully Modular: Each module can evolve independently.

CI/CD & Automation: GitHub Actions workflows ensure repeatable deployments.

Secure & Observable: End-to-end monitoring, logging, and least-privilege security.

Extensible: Easily integrates additional services or environments.
