terraform {
    required_version = ">= 1.4.0"

    required_providers{
        aws = {
            source = "hashicorp/aws"
            version = ">= 5.0"
        }
    }
backend "s3" {
         region = "eu-north-1"
        }
}

provider "aws" {
    region = "eu-north-1"
}

module "vpc" {
    source = "./modules/vpc"
    vpc_name = "vpc-dh"
    vpc_cidr_block = "10.0.0.0/16"
}
module "subnets" {
    source = "./modules/subnets"
    availability_zone_1 = "eu-north-1a"
    availability_zone_2 = "eu-north-1b"
    priv_cidr_block = "10.0.2.0/24"
    pub_cidr_block = "10.0.1.0/24"
    vpc_id = module.vpc.vpc_id
}
module "internet-facing-security-group" {
    source = "./modules/internet-facing-security-group"
    vpc_id = module.vpc.vpc_id
    cidr_ipv4 = "10.0.1.0/24"
    sg_allow_tls = module.internal-security-group.id
}

module "internal-security-group" {
    source = "./modules/internal-security-group"
    vpc_id = module.vpc.vpc_id
    cidr_ipv4 = "10.0.2.0/24"
    sg_allow_all = module.internet-facing-security-group.id
}

module "eip" {
    source = "./modules/eip"   
}

module "igw" {
    source = "./modules/igw"
    vpc_id = module.vpc.vpc_id
    name = "internet-gateway"
}

module "policy-document" {
    source = "./modules/policy-document"
    lb_bucket_arn = module.s3.arn
}

module "alb-s3-bucket-policy" {
    source = "./modules/alb-s3-bucket-policy"
    lb_bucket = module.s3.id
    s3_policy = "${module.policy-document.s3_policy}"
}

module "s3" {
    source = "./modules/s3"
    name = "dokihealth-alb-logs-bucket"
    env = "production"
    lb_bucket_policy = module.alb-s3-bucket-policy.lb_bucket_policy
}

module "nat-gateway" {
    source = "./modules/nat-gateway"
    name = "nat"
    subnet_id = module.subnets.private_subnet_id
    eip_id = module.eip.id
    internet_gateway = module.igw.id
}

module "priv-route-tables-association" {
    source = "./modules/priv-route-tables-association"
    priv_subnet_id = module.subnets.private_subnet_id
    route_table_id = module.private-route-table.id
}

module "pub_route_tables_association" {
    source = "./modules/pub-route-tables-association"
    pub_subnet_id = module.subnets.public_subnet_id
    route_table_id = module.public-route-table.id
}

module "public-route-table" {
    source = "./modules/public-route-table"
    vpc_id = module.vpc.vpc_id
    cidr_block = "0.0.0.0/0"
    igw_id = module.igw.id
    name = "public network route table"
}

module "private-route-table" {
    source = "./modules/private-route-table"
    vpc_id = module.vpc.vpc_id
    cidr_block = "0.0.0.0/0"
    nat_gw_id = module.nat-gateway.id
    name = "private network route table"
}

module "target-group" {
    source = "./modules/target-group"
    name = "dhtg"
    tg-port = 3000
    tg-type = "ip"
    protocol = "HTTP"
    vpc_id = module.vpc.vpc_id
    aws_alb = module.load-balancer.lb
}

module "ecs_cluster" {
    source = "./modules/ecs_cluster"
    name ="dh_ecs_cluster"
    dh_b2c_group_name = module.cloud-watch-log-group.name
}

module "fargate-task-definitions" {
    source = "./modules/fargate-task-definitions"

    # Task definition properties
    network_mode = "awsvpc"
    cpu = 256
    memory = 512

    # Container configuration
    container_name  = "dokihealth"
    container_image = "123507875554.dkr.ecr.eu-north-1.amazonaws.com/dokihealth-b2c:latest"
    container_cpu  = 128
    container_memory  = 256
    container_memoryReservation = 128
    execution_role_arn = module.iam.arn
    env = {
      
    }

    # Platform details
    operating_system = "LINUX"
    cpu_archi = "X86_64"
}

module "services" {
    source = "./modules/services"
    
    name = "dokihealth-fullstack"
    cluster_id = module.ecs_cluster.id
    task_definition = module.fargate-task-definitions.arn
    desired_count = 2
    alb = module.load-balancer.arn
    launch_type = "FARGATE"
    assign_public_ip = true
    force_new_deployment = true
    health_check_grace_period = 300
    security_group = module.internal-security-group.id

    # IAM and permissions
    subnets = module.subnets.public_subnet_id

    target_group_arn = module.target-group.arn
    container_name = "dokihealth"
    container_port = 3000
}

module "load-balancer" {
    source = "./modules/load-balancer"
    name = "lb-dh-b2c"
    is_internal = false
    load_balancer_type = "application"
    lb_sg = module.internet-facing-security-group.id
    subnets = module.subnets.subnets_list
    enable_deletion_protection = false
    lb_bucket = module.s3.id
    is_log_enabled = true
    env = "production"
}

module "acm" {
    source = "./modules/acm"
    domain_name = "dokihealth.com"
}

module "load-balancer-listener" {
  source = "./modules/load-balancer-listener"

  load_balancer_arn   = module.load-balancer.arn
  lb_port             = 443
  protocol            = "HTTPS"
  test_protocol       = "HTTP"
  ssl_policy          = "ELBSecurityPolicy-2016-08"
  certificate_arn     = module.acm.arn
  default_action_type = "forward"
  target_group_arn    = module.target-group.arn
  lb_http_port = 80
}

module "iam" {
    source = "./modules/iam"
    iam_role_name = "ecs-task-execution"
}

module "cloud-watch-log-group"{
    source = "./modules/cloud-watch-log-group"
}

module "cloudwatch-dashboard" {
    source = "./modules/cloudwatch-dashboard"
    elb_name = module.load-balancer.arn
    service_name = module.services.name
    target_group_name = module.target-group.arn
    cluster_name = module.ecs_cluster
    elb_region = "eu-north-1"
}


