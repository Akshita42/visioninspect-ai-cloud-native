resource "aws_instance" "visioninspect_server" {
  ami           = "ami-0f918f7e67a3323f0"
  instance_type = var.instance_type
  key_name      = var.key_name

  tags = {
    Name = "visioninspect-terraform-server"
  }
}