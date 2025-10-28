output "s3_policy" {
    value = data.aws_iam_policy_document.allow_access_from_local.json
}