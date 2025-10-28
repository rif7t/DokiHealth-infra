resource "aws_s3_bucket" "dokihealth-alb-logs-bucket" {
    bucket = "dokihealth-alb-logs-bucket"

    tags = {
        Name = var.name
        Environment = var.env
    }

}