# Intro to Game Making
In this tutorial we are going to make a simple single player version of the game agar.io.

## Introduction
If you have never used the canvas [Intro to Canvas](https://github.com/zbunde/intro_to_canvas/blob/master/readme.md) is a great intro guide to help with the canvas basics. But I will be explaining every aspect of the canvas that we need for this game.
## Setup
Either clone down this repository or create a new project with these files:

* index.html
* main.js
* utility.js
* Game.js
* Enemy.js
* Player.js
* Food.js

## Section 1: Adding a controllable player to the canvas
Alright lets get right into it. Add a canvas element to your index.html file with an ID of 'game' so we can find it easily in our game. Don't worry about the size of the canvas, we'll initialize that in the javascript.

```
<canvas id='game'></canvas>
```
Next lets add all of our javascript files into the html. Your index.html should look like this:

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Game Tutorial</title>

    <link rel="stylesheet" type="text/css" href="css/main.css">
  </head>
  <body>
    <canvas id='game'></canvas>

    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script type="text/javascript" src="js/utility.js"></script>
    <script type="text/javascript" src="js/main.js"></script>
    <script type="text/javascript" src="js/Game.js"></script>
    <script type="text/javascript" src="js/Player.js"></script>
    <script type="text/javascript" src="js/Enemy.js"></script>
    <script type="text/javascript" src="js/Food.js"></script>
  </body>
</html>

```

Lets move on to finding the canvas and drawing a border around it. You can close out the html file, we won't be looking at it again. Go over to your main.js file and inside the document.onready function find the canvas tag and get the 2D context of the canvas.

```
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
```

This allows us to draw on the canvas in 2D, you can also use .getContext('3d') to draw in 3 dimensions but we won't be going that far in this tutorial.
So now that we have the context of our canvas lets set its height and stroke a border to it so we can actually see where the canvas is on our page.

```
canvas.width = 1200;
canvas.height = 700;
```

Now we can draw a border using the strokeRect function. You can read about it [here](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeRect). The arguments are (x-coordinate, y-coordinate, width, height). When creating a game using rectangles it is important to note that x and y are the coordinates of the top left corner of the rectangle. This isn't going to be needed for our game.

```
context.strokeRect(0,0,canvas.width,canvas.height);
```

Drawing circles is a little more in depth. We need to start with 

```
context.beginPath();
```

This is like lifting your pen to get ready to draw. Next we choose what color we want the circle to be, the default is black which we're going to stick with for now.

```
context.fillStyle = 'black';
```

Then we need to make the actual circle. There is no draw circle method like there is with a rectangle but we have a arc() function which serves the purpose. Arc has a lot of arguments, the coordinates for the center of the circle, the radius, and how much of an arc you want to create. More specifically arc(x,y,radius,startAngle,finishAngle). Note the angles needed are in radians and 0 radians straight to the right of your center coordinates. For our purposes startAngle is always going to be 0 and finishAngle will be 2*Math.PI or if you want it can just be 6.28.

```
context.arc(200, 200, 30, 0, 6.28);
```

Now if you load your browser your still going to have a blank canvas. We have created the circle now we need to actually draw it. Here is our final line for our circle.

```
context.fill();
```

So your code together at this point should be:

```
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 700;
context.strokeRect(0,0,canvas.width,canvas.height);
  
context.beginPath();
context.fillStyle = 'black';
context.arc(200, 200, 30, 0, 6.28);
context.fill();
```

You should have a canvas with a border and a black circle inside it. Next lets throw our circle draw into a function in our utilities file so we can easily make circles in our game.

```
function circle(context, body){
  context.beginPath();
  context.fillStyle = body.color;
  context.arc(body.position.x, body.position.y, body.radius, 0, 6.28);
  context.fill();
}
```
Some of this we haven't implemented yet but I'll explain it as we create the Player object right now.

Here is our Player constructor:

```
var Player = function(width,height) {
  this.position = {x: width/2,
                          y: height/2};
  this.velocity = {x: 0,
                          y: 0};
  this.cursor = {x: this.position.x,
                        y: this.position.y};
  this.speed = 10;
  this.radius = 10;
  this.color = 'red';
};
```

Ok, lets go through what each of these properties represent. Position is the center of our Player circle. You'll notice that each point or vector in our game will be represented by an Object with an x and y key. 

* Our player is always going to start in the center of the screen (x = width/2 and y = height/2) where width and height are the dimensions of the canvas give us the center point. 
* The initial velocity of our player is set to 0, this is a vector representation of our movement. 
* This.cursor is going to show where our cursor currently is, it is initialized to the be the center of the circle so our player won't move until we move our cursor. 
* Our initial speed is 10, which is just an arbitrary number that will be continually changing later on.
* Our initial radius is set to 10 and will also be continually changing as we 'eat' other bodies
* Our color is set to red just to differentiate our player from the other bodies on the canvas.

Now let's create a function in our player that follows the movement of the cursor.

```
Player.prototype.setCursorLocation = function(event){
  this.cursor.x = event.pageX;
  this.cursor.y = event.pageY;
};
```

Right now this isn't actually doing anything, but lets head over to our main.js and add an eventListener to our mouseMove.

```
$('body').on('mousemove',function(e){
  player.setCursorLocation(e);
});
```

Now we can go back to the Player.js file and add a console log. Then go an look at your console and you can watch the x, y coordinates of your mouse.

```
Player.prototype.setCursorLocation = function(e){
  this.cursor.x = e.pageX;
  this.cursor.y = e.pageY;
  console.log('x:', this.cursor.x+ ' y:', this.cursor.y);
};
```

This is a good start, but really we want to do something with that information. Let's make a player that will follow our cursor movement. In our Player object we need a couple new functions.

```
Player.prototype.update = function(context){
  circle(context, this);
  this.move();
};

Player.prototype.move = function(){
  // sides of a right triangle joining
  var dx = this.cursor.x - this.position.x;
  var dy = this.cursor.y - this.position.y;
  var distance = Math.sqrt(dx*dx + dy*dy);

  //updates player position
  if(distance>5){
    this.velocity.x = (dx/distance)*this.speed;
    this.velocity.y = (dy/distance)*this.speed;
    this.position.x+=this.velocity.x;
    this.position.y+=this.velocity.y;
    // console.log('x: '+this.position.x+', y: '+this.position.y);
  }
};
```

The update function is the basic template we will be using for our Enemy.js and Food.js as well to make them update themselves on the canvas. Our move function has a bit of math behind it. We can find the distance between any two points on the canvas using the [pythagorean theorem](https://en.wikipedia.org/wiki/Pythagorean_theorem). We always know 2 sides of our right triangle on the canvas and sqrt(dx*dx + dy*dy) gives us the hypotenuse which is the distance between our points. 

Now for actually making the player move we need to do some [vector addition] (https://en.wikipedia.org/wiki/Euclidean_vector#Addition_and_subtraction). Simply put we just add the x-component to the x-component and the y-component to the y-component. This math is really important to understand because we will be using it all over this game and in any game you make in the future. If you get into 3D games then its even more difficult because your vectors have 3 components instead of just 2. 
One last change before you can see something on the canvas is in your main.js file add your player.update():

```
$('body').on('mousemove',function(event){
    player.setCursorLocation(event);
    player.update(context);
  });
```
Now you'll notice when you go to the canvas that your circle leaves a trail of itself behind as you move your cursor around the canvas. This is because we are continually redrawing the circle as it moves and never clearing the previously drawn circles. Let's fix that by creating our Game object which will call  everything else update function. In the process we are going to move some code from our main.js over to our Game.js file.

main.js
```
$(document).on('ready', function() {
  var game = new Game();
  var player = new Player(game.width, game.height);
  game.addBody(player);
  game.drawCanvas();
  $('body').on('mousemove',function(event){
    player.setCursorLocation(event);
  });
});
```

Game.js

```
var Game = function(){
  // finds the canvas element and gives it a height and width
  var canvas = document.getElementById('game');
  this.width = canvas.width = 1200;
  this.height = canvas.height = 700;
  this.context = canvas.getContext('2d');
  this.actors = [];
  this.food = [];
  this.animationFrame;
  this.foodInterval;
  this.paused = false;
  // this.init();
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
    // self.allCollisions();
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
};

Game.prototype.addBody = function(body){
  this.actors.push(body);
};

```

Alright so that is a lot of code, let's go through what each thing does. In our main.js file we initialize a Game and Player then to make sure the Player will be a part of the game we add it to our actors array in Game. Then to start our animations we call game.drawCanvas().

In our Game.js file we have a constructor that decides how large our canvas is going to be and initializes several variables. The drawCanvas function is our main function that makes the game animate itself. Within this function we have another function called frame which will be called every frame of game to update the canvas and drive all of our logic. You'll notice at the end of the function we need to call frame() to get our loop started. At the end of the frame function we have the line self.animationFrame = requestAnimationFrame(frame). This makes the browser call the frame function as often as possible. The requestAnimationFrame function shoots for 60 frames per second but may be a little lower depending on factors that are out of our control. Don't worry about the line calling allCollisions yet, we will get to that soon.

Take a look at your game, you should have a circle running around after your cursor.

## Section 2: Adding collision
By the end of this iteration we will have 'food' on the canvas and your player will be 'eating' the food. First lets make our Food object.

```
function Food(width,height){
  this.position = {x: Math.random()*width,
                   y: Math.random()*height};
  this.radius = Math.random()*2+4;
  this.color = 'black';
}

Food.prototype.update = function(context){
  circle(context, this);
};
```

That's all our food class will ever have, you can close that file and forget it exists. Let's make an init function for our Game.

```
Game.prototype.init = function(){
  for(var j=0;j<30;j++){
    this.addBody(new Food(this.width,this.height));
  }
  var self = this;
  this.foodInterval = window.setInterval(function(){self.addBody(new Food(self.width,self.height));},500);
};
```

Read about [setInterval](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setInterval) if you have never used it. This is a really cool function that has a lot of possibilities in different programs. But this basically adds a Food to our food array every 500ms. For this function to work we need to update our addBody function.

```
Game.prototype.addBody = function(body){
  if(body instanceof Food){
    this.food.push(body);
  } else {
    this.actors.push(body);
  }
};
```

Now you should have a bunch of Food appearing on your canvas. But we can't eat it yet! Let's add some collision to our game. First let's make sure when we collide something will happen to our player. This function takes the area of the body that is getting eaten and adds it to the area of the Player.

```
Player.prototype.grow = function(body){
  var myArea = this.radius*this.radius*3.14;
  var bodyArea = body.radius*body.radius*3.14;
  myArea+=bodyArea;
  this.radius = Math.sqrt(myArea/3.14);
  this.speed = 100/this.radius;
};
```

Next let's add a basic collision between circles. This simply checks if the distance is less than the sum of both body's radii. If it is, then the bodies are colliding.

```
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
```

Now we need something to happen when our circles collide. 

```
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
```

This function only checks if any actors are colliding with food because food should never move and collide with other food. When they collide it checks to make sure that the radius of the actor is larger than the food (which it always should be) then makes the actor grow and removes the Food object from our food array.

Lastly lets update our frame function so we are actually using the code we just wrote with:

```
self.foodCollisions();
```

You should now have a red Player circle that you can move around the canvas and eat and grow indefinitely.

## Section 3: Adding enemies

