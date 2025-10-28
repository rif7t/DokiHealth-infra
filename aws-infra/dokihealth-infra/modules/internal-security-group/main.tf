resource "aws_security_group" "allow_tls" {
  name        = "allow_tls"
  description = "Allow TLS inbound traffic and all outbound traffic"
  vpc_id      = var.vpc_id

  tags = {
    Name = "allow_tls"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_tls_ipv4" {
  referenced_security_group_id = var.sg_allow_all
  ip_protocol       = "TCP" 
  from_port = 443
  to_port = 3000
  security_group_id = aws_security_group.allow_tls.id

}

