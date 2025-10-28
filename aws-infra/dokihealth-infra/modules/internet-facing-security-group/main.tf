resource "aws_security_group" "allow_all" {
  name        = "allow_all"
  description = "Allow all inbound traffic and all outbound traffic"
  vpc_id      = var.vpc_id

  tags = {
    Name = "allow_all"
  }

}

resource "aws_vpc_security_group_egress_rule" "allow_traffic_to_private_subnet" {
  referenced_security_group_id = var.sg_allow_tls
  security_group_id = aws_security_group.allow_all.id
  from_port = 443
  to_port = 3000
  ip_protocol       = "TCP" 
}

resource "aws_vpc_security_group_ingress_rule" "allow_traffic_from_internet" {
  security_group_id = aws_security_group.allow_all.id
  from_port = 443
  to_port = 443
  ip_protocol       = "TCP" 
  cidr_ipv4 = "0.0.0.0/0"
}
resource "aws_vpc_security_group_ingress_rule" "allow_traffic_from_internet_http" {
  security_group_id = aws_security_group.allow_all.id
  from_port = 80
  to_port = 80
  ip_protocol       = "TCP" 
  cidr_ipv4 = "0.0.0.0/0"
}