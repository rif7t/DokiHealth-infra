variable "vpc_id" {
    description = "identification number of the main vpc to attach to the security group"
    type = string
}

variable "cidr_ipv4" {
    description = "ipv4 cidr block of the aws vpc to attach to"
}

variable "sg_allow_tls" {

}

