resource "aws_route_table_association" "pub"{
    subnet_id = var.pub_subnet_id
    route_table_id = var.route_table_id
}

