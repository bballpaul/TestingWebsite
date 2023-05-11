var socket;

//build in function that runs once at the start of the program
function setup() {
  //creates the canvas which the program is visualized on
  createCanvas(800, 800);
  //calls the function to create the list full of 0's which will store the position of the game pieces
  
  socket = io.connect("https://socket-io-generic-example.glitch.me/");
  
  socket.on('connect', function() {
    console.log("Connected");
  });
  
  
  //receive from server
  socket.on('generic_message', function (data) {
      //console.log(data);
      //ellipse(data.x, data.y, 50, 50);
    player_moved(data);
  });
  
  createGameList();
}

//creates the list which will contain the position of the pieces
//this will be a 2 dimensional list so that the position of the pieces matches its x and y position in the list | The list will by a 7 x 6 list
//inside the list, a 0 will be an empty square, a 1 will be a yellow piece, and a 2 will be a red piece
gameList = [];

//a varible that stores which player moves next | 1 for player 1 (yellow) or 2 for player 2 (red)
nextMove = 1;

//a variable that is true when a piece is falling into the board
//this is used to make sure a player can only make their move when the pieces in the board are set
moving = false;


//function which is called to create the empty game list
//called in the setup function
function createGameList(){
  for(x = 0; x < 7; x++){
    //inside the game List, create another list on each x position, making it 2d
    gameList[x] = [];
    for(y = 0; y < 6; y++){
      //puts a zero in for each list spot, representing an empty grid position
      gameList[x][y] = 0;
    }
  }
}

//function which holds the drawing and functionality of the reset button
function resetButton(){
  //don't draw outlines
  noStroke();
  //the color for the button in grayscale (0 is black, 255 is white)
  buttonFill = 180;
  
  //check if the position of the mouse is within the bounds of the reset button
  if(mouseX >= 325 && mouseX <= 475 && mouseY >= 757 && mouseY <= 797){
    //if they are within, change the fill variable of the rectangle to a lighter cover to show the user hovering over it
    buttonFill = 200;
    //check if the mouse is pressed
    if(mouseIsPressed == true){
      //if it is, change the fill variable of the rectangle to a darker color to show the user pressing it
      buttonFill = 160;
      //when the button is pressed, call createGameList to fill the list with 0s again
      createGameList();
      //reset the gameWinner variable
      gameWinner = undefined;
      //reset the move counter so that it is player 1's move
      nextMove = 1;
    }
  }
  //fill the rectangle with the color in the variable buttonFill
  fill(buttonFill);
  //draw the rectangle
  rect(325, 757, 150, 40);
  //fill the text with a slightly darker color than the rectangle
  fill(buttonFill - 80);
  //change the size of the text to 25
  textSize(25);
  //draw the text in the button
  text("Reset Game", 330, 785);
}

//a function which draws the shapes used to make the four in a row grid
function draw_grid(){
  //stroke causes the shapes to have outlines
  stroke(0);
  //strokeWeight sets the width of the outline
  strokeWeight(8);
  //noFill means the shape has no center filled in
  noFill();
  //draws the rectangle, acting as an outline for the grid
  rect(50, 150, 700, 600)
  //noStroke means the shapes will be draw without outlines
  noStroke();

  //nested for loop which is used to draw the grid
  //it is nested to create grid pieces in both the x and y direction
  //starts at x = 50 and y = 200 to leave room on both sides as well as the top and bottom of the canvas
  for(x = 50; x < 750; x += 100){
    for(y = 150; y < 750; y += 100){
      
      //fill sets the color the grid is filled in with
      fill(150, 150, 225);
      //begins the drawing of the grid piece
      beginShape();
      //the vertex function draws a vertex to the piece, and draws them in a clockwise motion
      vertex(x, y);
      vertex(x + 100, y);
      vertex(x + 100, y + 100);
      vertex(x, y + 100);
      //beings the drawing of the center cutout of the grid piece
      beginContour();
      //the vertex function here does the same thing, but this time I draw them in a conter clockwise motion in order to get the cutout
      //I call the stroke function so the inside of each of the squares is also outlined
      vertex(x + 25, y + 25);
      vertex(x + 25, y + 75);
      vertex(x + 75, y + 75);
      vertex(x + 75, y + 25);
      //end the drawings of both the Contour and the Shape
      endContour();
      endShape();
      //this rectangle is acting as an outline for the inside of each grid piece
      noFill();
      stroke(0);
      strokeWeight(4);
      rect(x + 25, y + 25, 50, 50);
      noStroke();
    }
  }
}

//a function which reads the values in the gameList, and draws the pieces on the board based on that
function draw_chips(){
  //a nested for loop to iterate through every position on the board
  for(x = 0; x < 7; x++){
    for(y = 0; y < 6; y++){
      //if the list value is 1, draw a yellow piece there
      if(gameList[x][y] == 1){
        //the fill color of the piece
        fill(255, 255, 0, 125);
        //the outline color of the piece
        stroke(200, 200, 0);
        //the outer circle of the piece
        ellipse(x * 75 + 25 * x + 100, y * 100 + 200, 50, 50);
        noFill();
        //the inner circle of the piece
        ellipse(x * 75 + 25 * x + 100, y * 100 + 200, 30, 30);
      //if the list value is 2, draw a red piece there
      }else if(gameList[x][y] == 2){
        fill(255, 0, 0, 125);
        stroke(200, 0, 0);
        ellipse(x * 75 + 25 * x + 100, y * 100 + 200, 50, 50);
        noFill();
        ellipse(x * 75 + 25 * x + 100, y * 100 + 200, 30, 30);
      }
    }
  }
}

//a function that is called when it is a player's turn
//it draws the semi-transparent chips above the board, and highlights the one the mouse is over
//when the player clicks on one of the disks, it runs the player_one_moved or player_two_moved functions based on the turn
function select_row(){
  //draw the transparent disks and check if the mouse is hovering over any of them
  //if it is over one of them, make that one the color of the chip whose turn it is that move
  for(i = 0; i < 7; i ++){
    //fill the chips with their semi-transparent color
    fill(125, 125, 125, 125);
    //set the outline color of the semi-transparent chips
    stroke(200);
    //check if the mouse is hoverin over any of the chips
    if(mouseX > i * 75 + 25 * i + 65 && mouseX < i * 75 + 25 * i + 135 && mouseY > 65 && mouseY < 135){
      //if the mouse is hovering over a chip, and it is player 1's move, highlight that chip yellow
    if(nextMove == 1){
      fill(255, 255, 0, 125);
      stroke(200, 200, 0);
      //if the mouse is hovering over the chip, it is player 1's move, and the mouse is pressed, call the function to declare the move, passing i as the variable, which is the collumn that the player dropped the chip in
      if(mouseIsPressed){
        socket.emit("generic_message", i);
        //player_moved(i);
        break;
      }
    }
      //same as the above piece of code, but this time for player 2, and highlighting the piece red
    if(nextMove == 2){
      fill(255, 0, 0, 125);
      stroke(200, 0, 0);
      if(mouseIsPressed){
        socket.emit("generic_message", i);
        //player_moved(i);
        break;
      }
    }
    }
    
    //call the drawing of the pieces at the bottom, so the changes to the fill will affect them
    ellipse(i * 75 + 25 * i + 100, 100, 70, 70);
    noFill();
    ellipse(i * 75 + 25 * i + 100, 100, 50, 50)
    
  }
}

//I use let here to make the variables in the functions player_one_moved and player_two_movde global variables because I need to use them in the draw function to make the chips fall.

//the furthest spot a piece can fall in the collumn
let bottomSpot;
//the x and y of the piece which will fall
let pieceX;
let pieceY;
//the current velocity of the falling piece
let pieceVelocity;
//the variable which determines the acceleration of gravity
let gravity;
//the collumn the piece was dropped in
let pieceColumn;

//the winner of the game in the case of a 4 in a row
let gameWinner;

//the function that is run when a player makes their move
function player_moved(column){
  //set the starting spot of the variable at the bottom-most possible position
  bottomSpot = 5;
  //set the current collumn of the piece to the parameter that was passed for it. This also makes that value accessable globally since the variable is global
  pieceColumn = column;
  //find the x position of the piece on the canvas using its collumn
  pieceX = pieceColumn * 75 + 25 * column + 100;
  //the y position of the piece on the canvas (the same as where the transparent pieces were)
  pieceY = 100;
  //the starting velocity of the piece is 0;
  pieceVelocity = 0;
  //the value of gravity which will be used to accelerate the piece.
  gravity = 0.98;
  
  //find the spot it will fall to, by starting at the bottom of the collumn and iterating up untill it finds the first empty square. Set the bottomSpot variable to this value
  for(i = 5; i > -1; i--){
    if(gameList[pieceColumn][i] == 0){
      bottomSpot = i;
      //set moving to true, which starts the animation of the piece falling
      moving = true;
      break;
    }
  }
}


//this function is the algorithm that checks if there is a win every time a move is made
//it works by starting at the last piece that was placed, and for every axis a win can happen on (horizontal, vertical, diagonal left and right), it finds all the same color pieces in one direction, and then in the other direction, and if there is 4 or more in a row, the player which made the last move wins.
function checkWin(x, y, turn){
  //checkX and checkY are the current x and y positions on the board which are being checked to see what color the piece is
  checkX = x;
  checkY = y;
  //numInRow is the counter used to determine if there is 4 or more pieces in a row
  numInRow = 0;
  
  //check for horizontal win
  //while the pieces are the same color, check left untill the pieces are not the same color
  while(gameList[checkX][checkY] == turn){
    //this if statement is a qualification which prevents the check from being outside the bounds of the playing board
    if(checkX == 0){
      checkX -= 1;
      break;
    }
    checkX -= 1;
  }
  //since the last piece it checks is not the same color, add 1 to the check position so it will start counting on a piece that is the same color
  checkX += 1;
  //while the pieces are the same color, go all the way in the opposite direction untill the pieces are not the same color, adding 1 to numInRow
  while(gameList[checkX][checkY] == turn){
    numInRow += 1;
    //another qualification preventing the check from being out of bounds
    if(checkX == 6){
      break;
    }
    checkX += 1;
  }
  //if the numInRow is 4 or greater, a player has won, so run the gameWon function with the player who last placed a piece as the "turn" parameter
  if(numInRow >= 4){
    gameWon(turn);
    return;
    //if no player has won, reset the counter, reset the x and y of the checks, and move on to the next possible win direction
  }else{
    numInRow = 0;
    checkX = x;
    checkY = y;
  }
  
  //check for vertical win
  //this is almost exactly the same as the previous checks, but rather than checking in the x direction, it checks in the y direction
  while(gameList[checkX][checkY] == turn){
    checkY += 1;
  }
  checkY -= 1;
  while(gameList[checkX][checkY] == turn){
    checkY -= 1;
    numInRow += 1;
  }
  if(numInRow >= 4){
    gameWon(turn);
    return;
  }else{
    numInRow = 0;
    checkX = x;
    checkY = y;
  }
  
  //check for diagonal win left
  //this checks for a win along the diagonal, so it alters both the checkX and checkY variables
  //again, very similar to the previous two checks
  while(gameList[checkX][checkY] == turn){
    if(checkX == 0){
      checkX -= 1
      checkY += 1;
      break;
    }
    checkX -= 1
    checkY += 1;
  }
  checkX += 1;
  checkY -= 1;
  while(gameList[checkX][checkY] == turn){
    numInRow += 1;
    //another qualification preventing errors
    if(checkX == 6){
      break;
    }
    checkX += 1;
    checkY -= 1;
  }
  if(numInRow >= 4){
    gameWon(turn);
    return;
  }else{
    numInRow = 0;
    checkX = x;
    checkY = y;
  }
  
  //check for diagonal win right
  //the same as the previous one, but in the other diagonal
  while(gameList[checkX][checkY] == turn){
    if(checkX == 6){
      checkX += 1;
      checkY += 1;
      break;
    }
    checkX += 1;
    checkY += 1;
  }
  checkX -= 1;
  checkY -= 1;
  while(gameList[checkX][checkY] == turn){
    numInRow += 1;
    //qualification to prevent errors
    if(checkX == 0){
      break;
    }
    checkX -= 1;
    checkY -= 1;

  }
  if(numInRow >= 4){
    gameWon(turn);
    return;
  }else{
    numInRow = 0;
    checkX = x;
    checkY = y;
  }
  
  //since at this point the move has been made and the chip has fallen into the board, it can now change which player's move it is
  if(turn == 1){
    nextMove = 2;
  }
  if(turn == 2){
    nextMove = 1;
  }
}


//this function is called when a player gets 4 in a row
//it checks which player won by using the "winner" parameter, and then changes the gameWinner variable, which is used later in the "draw" function, and sets the nextMove variable to 0, so that moves can no longer be made
function gameWon(winner){
  gameWinner = winner;
  nextMove = 0;
}

//a built-in function which is called 60 times every second to draw the canvas and everthing on it
function draw() {
  //sets the background color of the canvas
  background(220);
  
  //socket.emit("generic_message", {x: mouseX, y: mouseY});
  
  //an if statement which prevents the next player from making a move before the last piece has finished falling all the way
  if(moving == false && nextMove != 0){
    select_row();
  }
  
  //if the piece is moving, and it is player 1's move (meaning they made the move), then it animates the piece falling into place
  if(moving == true && nextMove == 1){
    //the velocity of the piece is added to the y position
    pieceY += pieceVelocity;
    //the gravity is added to the velocity, creating an acceleration affect which mimics that of gravity
    pieceVelocity += gravity;
    //since it is player one's piece, fill the piece yellow
    fill(255, 255, 0, 125);
    stroke(200, 200, 0);
    //draw the shape of the piece
    ellipse(pieceX, pieceY, 50, 50);
    noFill();
    ellipse(pieceX, pieceY, 30, 30);
    
    //if the piece has reached its spot, we can finally set the list value to 1, so that it will be drawn in that spot from now on
    if(pieceY >= bottomSpot * 100 + 200){
      gameList[pieceColumn][bottomSpot] = 1;
      //run the function that checks for a win, inputting the grid coordinates of the last placed piece and who made the move, so that the check can start from there
      checkWin(pieceColumn, bottomSpot, nextMove);
      //moving is set to false, so now the next move can be made, as shown previously
      moving = false;

    }
  }
  
  //nearly the same as the above chunk of code, but instead of being player 1, it is for player 2's pieces
  if(moving == true && nextMove == 2){
    pieceY += pieceVelocity;
    pieceVelocity += gravity;
    fill(255, 0, 0, 125);
    stroke(200, 0, 0);
    ellipse(pieceX, pieceY, 50, 50);
    noFill();
    ellipse(pieceX, pieceY, 30, 30);
    
    if(pieceY >= bottomSpot * 100 + 200){
      gameList[pieceColumn][bottomSpot] = 2;
      //run the function that checks for a win, inputting the grid coordinates of the last placed piece and who made the move, so that the check can start from there
      checkWin(pieceColumn, bottomSpot, nextMove);
      moving = false;

    }
  }
  
  
  //cals the function "draw_chips" in order to draw the chips that have been placed in the list
  draw_chips();
  //calls the function "draw_grid" in order to draw the four in a row grid every frame
  //this is at the end of the "draw" function so that the grid will be drawn above the pieces so it appears the pieces sit behind the grid
  draw_grid();
  
  //if the variable changed in the "gameWon" function is set to 1, player 1 has won, so draw the text "Yellow Wins"
  if(gameWinner == 1){
    fill(255, 255, 0);
    stroke(2)
    textSize(50);
    text("Yellow Wins", 250, 100);
  }
  
  //if the variable changed in the "gameWon" function is set to 2, player 2 has won, so draw the text "Red Wins"
  if(gameWinner == 2){
    fill(255, 0, 0);
    stroke(2)
    textSize(50);
    text("Red Wins", 270, 100);
  }
  
  //calls the function for the reset every frame, so the button is drawn
  resetButton();
}
