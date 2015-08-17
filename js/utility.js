function circle(context, body){
  context.beginPath();
  context.fillStyle = body.color;
  context.arc(body.position.x, body.position.y, body.radius, 0, 6.28);
  context.fill();
}
