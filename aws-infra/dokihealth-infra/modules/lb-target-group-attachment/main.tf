resource "aws_lb_target_group_attachment" "lb-tg-attachment" {
    target_group_arn = var.target_group_arn
    port = var.target_port
}