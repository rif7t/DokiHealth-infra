resource "aws_s3_bucket_policy" "alb_logs_policy" {
  bucket = var.lb_bucket
  policy = var.s3_policy
}
