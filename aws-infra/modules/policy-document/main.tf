data "aws_iam_policy_document" "allow_access_from_local" {
    statement{
        principals{
            type = "AWS"
            identifiers = ["*"]
        }

        actions = [
            "s3:GetObject",
            "s3:ListBucket",
            "s3:PutObject"
        ]

        resources = [
            var.lb_bucket_arn , "${var.lb_bucket_arn}/*",
        ]
    }
}