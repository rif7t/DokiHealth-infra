resource "aws_ecs_task_definition" "main" {
    family = "main"
    requires_compatibilities = ["FARGATE"]
    network_mode = var.network_mode
    cpu = var.cpu
    memory = var.memory
    execution_role_arn = var.execution_role_arn
    container_definitions = jsonencode([
    {
      environment           = [var.env]
      name                  = var.container_name
      image                 = var.container_image
      cpu                   = var.container_cpu
      memory                = var.container_memory
      memoryReservation     = var.container_memoryReservation
      essential             = true

      portMappings = [{
        containerPort = 3000
        hostPort = 3000
      }]
    }
  ])

        runtime_platform{
            operating_system_family = var.operating_system
            cpu_architecture = var.cpu_archi
        }
}