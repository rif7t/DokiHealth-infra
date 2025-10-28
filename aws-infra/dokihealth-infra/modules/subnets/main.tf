resource "aws_subnet" "public_subnet" {
    availability_zone = var.availability_zone_1
    vpc_id = var.vpc_id
    cidr_block = var.pub_cidr_block
    tags = {
        Name  = "subnet for eu-north-1a" 
    }
}

resource "aws_subnet" "private_subnet" {
    availability_zone = var.availability_zone_2
    vpc_id = var.vpc_id
    cidr_block = var.priv_cidr_block
    tags = {
        Name  = "subnet for eu-north-1b" 
    }
}