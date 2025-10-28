resource "aws_iam_role" "task_role" {
    name = var.iam_role_name
    assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json    
}

data "aws_iam_policy_document" "ecs_task_assume" {
    statement {
        actions = ["sts:AssumeRole"]
        principals {
            type = "Service"
            identifiers = ["ecs-tasks.amazonaws.com"]
        }
    }
}

resource "aws_iam_policy" "custom" {
  for_each = fileset("${path.module}/policies", "*.json")

  name   = replace(each.value, ".json", "")
  policy = file("${path.module}/policies/${each.value}")
}


resource "aws_iam_role_policy_attachment" "custom_attach" {
    for_each = aws_iam_policy.custom
    role = aws_iam_role.task_role.name
    policy_arn = each.value.arn
}

resource "aws_iam_role_policy_attachment" "task_execution_policy" {
    role = aws_iam_role.task_role.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

