resource "aws_route_table" "private_route_table" {
    vpc_id = var.vpc_id

    route {
        cidr_block = var.cidr_block
        nat_gateway_id = var.nat_gw_id
    }

    tags = {
        Name = var.name
    }
}