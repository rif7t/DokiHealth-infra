variable "name" {
    description = "name of nat gateway"
}

variable "subnet_id" {
    description  = "id of private subnet to associate with"
}

variable "eip_id" {
    description = "elastic ip to associate nat gateway with"
}

variable "internet_gateway" {
    description = "the internet gateway this nat gateway depends on"
}