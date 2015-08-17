// add scripts

$(document).on('ready', function() {
  var game = new Game();
  var player = new Player(game.width, game.height);
  game.addBody(player);
  game.drawCanvas();
  $('body').on('mousemove',function(event){
    player.setCursorLocation(event);
  });
});
