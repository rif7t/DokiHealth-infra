variable "name" {
    description = "load balancer name"
}

variable "is_internal" {
    description = "is load balancer internal"
}

variable "load_balancer_type" {
    description = "type of load balancer, e.g application, network"
}

variable "lb_sg" {

}

variable "subnets" {
    description = "subnets this loadbalancer is a part of"
    type = list(string)
}

variable "enable_deletion_protection" {

}

variable "lb_bucket" {
    description = "s3 bucket to store lb logs"
}

variable "is_log_enabled" {
    description = "it enable taking enabled for this load balancer."
}

variable "env" {

}
