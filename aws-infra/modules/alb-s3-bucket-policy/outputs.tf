output "lb_bucket_policy" {
    value = aws_s3_bucket_policy.alb_logs_policy
}