resource "aws_cloudwatch_dashboard" "ecs_dashboard" {
  dashboard_name = "ecs-service-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "text"
        x     = 0
        y     = 0
        width = 24
        height = 1
        properties = {
          markdown = "ECS Service Overview"
        }
      },
      {
        type = "metric"
        x     = 0
        y     = 1
        width = 12
        height = 6
        properties = {
          title   = "ECS CPU Utilization (%)"
          region  = var.elb_region
          stat    = "Average"
          period  = 60
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", tostring(var.service_name)]
          ]
        }
      },
      {
        type = "metric"
        x     = 12
        y     = 1
        width = 12
        height = 6
        properties = {
          title   = "ECS Memory Utilization (%)"
          region  = var.elb_region
          stat    = "Average"
          period  = 60
          metrics = [
            ["AWS/ECS", "MemoryUtilization", "ServiceName", tostring(var.service_name)]
          ]
        }
      },
      {
        type = "metric"
        x     = 0
        y     = 7
        width = 12
        height = 6
        properties = {
          title   = "Task Counts (Running / Pending / Desired)"
          region  = var.elb_region
          stat    = "Average"
          period  = 60
          metrics = [
            ["AWS/ECS", "RunningTaskCount", "ServiceName", tostring(var.service_name)],
            ["AWS/ECS", "PendingTaskCount",  "ServiceName", tostring(var.service_name)],
            ["AWS/ECS", "DesiredTaskCount",  "ServiceName", tostring(var.service_name)]
          ]
        }
      },
      {
        type = "metric"
        x     = 12
        y     = 7
        width = 12
        height = 6
        properties = {
          title   = "Cluster Reservations (%)"
          region  = var.elb_region
          stat    = "Average"
          period  = 60
          metrics = [
            ["AWS/ECS", "CPUReservation"]
          ]
        }
      },
      {
        type = "text"
        x     = 0
        y     = 13
        width = 24
        height = 1
        properties = {
          markdown = " Load Balancer Metrics"
        }
      },
      {
        type = "metric"
        x     = 0
        y     = 14
        width = 12
        height = 6
        properties = {
          title   = "Requests per Minute"
          region  = var.elb_region
          stat    = "Sum"
          period  = 60
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "TargetGroup", tostring(var.target_group_name)]
          ]
        }
      },
      {
        type = "metric"
        x     = 12
        y     = 14
        width = 12
        height = 6
        properties = {
          title   = "Target Response Time (s)"
          region  = var.elb_region
          stat    = "Average"
          period  = 60
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "TargetGroup", tostring(var.target_group_name)]
          ]
        }
      },
     
      {
        type = "metric"
        x     = 12
        y     = 20
        width = 12
        height = 6
        properties = {
          title   = "Target Health Status"
          region  = var.elb_region
          stat    = "Average"
          period  = 60
          metrics = [
            ["TargetGroup", tostring(var.target_group_name)],
          ]
        }
      }
    ]
  })
}
