resource "aws_lb" "lb"{
    name = var.name
    internal = var.is_internal
    load_balancer_type = var.load_balancer_type
    security_groups = [var.lb_sg]
    subnets = var.subnets


    enable_deletion_protection = var.enable_deletion_protection

    access_logs {
        bucket = var.lb_bucket
        prefix = "lb-"
        enabled = var.is_log_enabled
    }

    tags = {
        Environment = var.env
    }
}