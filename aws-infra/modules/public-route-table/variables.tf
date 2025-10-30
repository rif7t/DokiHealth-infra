variable "vpc_id" {

}
variable "cidr_block" {
    description = "cidr block of the public subnet to route"
}

variable "igw_id" {
    description = "id of the internet gateway to route cidr_block requests to"
}

variable "name" {
    description = "name of route table"
}