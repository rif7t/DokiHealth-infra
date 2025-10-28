resource "aws_lb_target_group" "ip-target" {
    name = var.name
    port = var.tg-port
    protocol = var.protocol
    target_type = var.tg-type
    vpc_id = var.vpc_id

    health_check{
        enabled = "true"
        healthy_threshold = "5"
        interval = "30"
        path = "/"
        protocol = "HTTP"
        unhealthy_threshold = "2"
        timeout = "8"
    }

    depends_on = [var.aws_alb]
}