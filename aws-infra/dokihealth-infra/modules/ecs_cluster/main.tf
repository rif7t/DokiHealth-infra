resource "aws_ecs_cluster" "ecs_cluster" {
    name = var.name

    setting {
        name = "containerInsights"
        value = "enabled"
    }
    configuration{
        execute_command_configuration{
            logging = "OVERRIDE"
            log_configuration{
                cloud_watch_encryption_enabled = true
                cloud_watch_log_group_name = var.dh_b2c_group_name
            }
        }
    }
}