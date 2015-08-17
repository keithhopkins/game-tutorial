var Game = function(){
  var canvas = document.getElementById('game');
  this.width = canvas.width = 1200;
  this.height = canvas.height = 700;
  this.context = canvas.getContext('2d');
  this.actors = [];
  this.food = [];
  this.animationFrame;
  this.foodInterval;
  this.paused = false;
  this.init();
};

Game.prototype.init = function(){
  // for(var i=0;i<1;i++){
  //   this.addBody(new Enemy(this.width,this.height));
  // }
  for(var j=0;j<30;j++){
    this.addBody(new Food(this.width,this.height));
  }
  var self = this;
  this.foodInterval = window.setInterval(function(){self.addBody(new Food(self.width,self.height));},500);
};

Game.prototype.drawCanvas = function(){
  var self = this;
  function frame(){
    //clears the canvas to then be redrawn
    self.context.clearRect(0, 0, self.width, self.height);
    //creates border
    self.context.strokeRect(0,0,self.width,self.height);
    //calls the update function of every body in the canvas
    self.updateAll();
    //tests for collisions across the canvas
    self.foodCollisions();
    self.animationFrame = requestAnimationFrame(frame);
  }
  frame();
};

// calls update function on all elements on the canvas
Game.prototype.updateAll = function(){
  // call each actor's update function
  this.actors.forEach(function(actor){
    actor.update(this.context,this.food,this.actors);
  },this);
  //call each food's update function
  this.food.forEach(function(food){
    food.update(this.context);
  },this);
};

Game.prototype.addBody = function(body){
  if(body instanceof Food){
    console.log('added food');
    this.food.push(body);
  } else {
    this.actors.push(body);
  }
};

//checks if any actor is colliding food and makes the actor eat the food
Game.prototype.foodCollisions = function(){
  for(var i=0;i<this.actors.length;i++){
    for(var j=0;j<this.food.length;j++){
      if(this.collision(this.actors[i],this.food[j])){
        if(this.actors[i].radius>this.food[j].radius){
          this.actors[i].grow(this.food[j]);
          this.food.splice(j,1);
          return true;
        }
      }
    }
  }
  return false;
};

// tests for collision between 2 circles
Game.prototype.collision = function(body1, body2){
  //this if statement 'should' never be triggered but it is there for a failsafe
  if(body1===body2)
    return false;
  //finds distance between circles using pythagorian theorum
  var distanceX = body1.position.x - body2.position.x;
  var distanceY = body1.position.y - body2.position.y;
  var squareDistance = distanceX*distanceX+distanceY*distanceY;
  return squareDistance <= (body1.radius+body2.radius)*(body1.radius+body2.radius);
};
