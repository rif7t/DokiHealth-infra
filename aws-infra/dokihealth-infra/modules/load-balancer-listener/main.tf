resource "aws_lb_listener" "full_stack" {
    load_balancer_arn = var.load_balancer_arn
    port = var.lb_port
    protocol = var.protocol
    ssl_policy = var.ssl_policy
    certificate_arn = var.certificate_arn
    
    default_action {
        type = var.default_action_type
        target_group_arn = var.target_group_arn
    }
}

resource "aws_lb_listener" "http_listener" {
    load_balancer_arn = var.load_balancer_arn
    port = var.lb_http_port
    protocol = var.test_protocol
    
    default_action {
        type = var.default_action_type
        target_group_arn = var.target_group_arn
    }
}