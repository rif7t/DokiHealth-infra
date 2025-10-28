output "private_subnet_id" {
    value = aws_subnet.private_subnet.id
}

output "public_subnet_id" {
    value = aws_subnet.public_subnet.id
}

output "subnets_list" {
    value = [aws_subnet.private_subnet.id, aws_subnet.public_subnet.id]
}
