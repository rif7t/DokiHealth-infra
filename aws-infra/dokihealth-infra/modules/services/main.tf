resource "aws_ecs_service" "main" {
    name = var.name
    cluster = var.cluster_id
    task_definition = var.task_definition
    desired_count = var.desired_count
    depends_on = [var.alb ]
    launch_type = var.launch_type
    force_new_deployment = var.force_new_deployment
    health_check_grace_period_seconds = var.health_check_grace_period
    
    network_configuration {
    subnets = [var.subnets]  
    security_groups = [var.security_group]      
    assign_public_ip = var.assign_public_ip
  }

    load_balancer {
        target_group_arn = var.target_group_arn
        container_name = var.container_name
        container_port = var.container_port
    }

}