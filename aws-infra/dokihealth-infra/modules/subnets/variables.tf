variable "availability_zone_1" {
    description = "availability zone for the public subnet"
    type = string
}

variable "availability_zone_2" {
    description = "availability zone for the private subnet"
    type = string
}

variable "pub_cidr_block" {
    description = "ip block for public subnet"
    type = string
}

variable "priv_cidr_block" {
    description = "ip block for private subnet"
    type = string
}

variable "vpc_id" {
    type = string
}


