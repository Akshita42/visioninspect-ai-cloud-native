output "instance_id" {
  value = aws_instance.visioninspect_server.id
}

output "public_ip" {
  value = aws_instance.visioninspect_server.public_ip
}