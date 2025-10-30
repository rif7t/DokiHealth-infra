resource "aws_route_table_association" "priv"{
    subnet_id = var.priv_subnet_id
    route_table_id = var.route_table_id
}

