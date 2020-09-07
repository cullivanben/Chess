# Chess

A real time chess web app for playing chess with your friends!

[Live Chess](https://live-chess.herokuapp.com) (I am using free tier hosting, so the initial load time can be slow sometimes.)

Generate a game id and share it with your opponent. Once you both enter it on the home screen you can play chess. 

The tech stack of this application consists of React, Express, Redis, and MongoDB.

Have fun playing chess!

## Design

### Front End

I created a class for each chess piece that stores the color, svg url and whether it belongs to the current player (is friendly).

The majority of gameplay logic resides in the Movement.js file where each piece has a method determining whether it can move given the current state of the board.

The biggest challenge I encountered was determining whether a move would endanger the friendly king. In order to do this, I calculated the state 
that the board would be in if the move happened and in that hypothetical state if the king was in check I was able to conclude that the move was not legal.

A similar challenge was determining whether a move whould remove the friendly king from check. As you can imagine, there are several cases. The king could move 
to a safe square, 
a friendly piece could block the attacker, or a friendly piece could kill the attacker. Of course, if none of those were possible it was easy to conclude that the 
friendly king is in checkmate. Furthermore, in any scenario where the friendly king was in check I made sure that a player was only allowed to make moves that removed it from check.
 
My favorite part of the gameplay logic was implementing castling. Since whether a castle is possible depends on several factors other than the location of pieces,
 (such as whether the pieces have already moved or the king is in check or will pass through a square that is being attacked), it was somewhat difficult to 
 implement but very satisfying when I did.

The state of the game is stored in the Board React Component. Each time a player updates the state of their board the update is immediately sent to the other
player via the Express and socketIO backend. This allows the game to have real time updates.

The last major thing that I had to take care of was making sure the state of the game persisted if the user refreshed their page. In order to do this I saved the 
state of the game to local storage and then re-loaded it when the Board Component re-mounted.

### Back End

I used socketIO for real time updates. Each game between two players has its own room ID so that board updates are not contaminated between separate 
games. Redis is used to store the room IDs with each player's session ID in order to be able to re-add them to their current game if they refresh their page. I chose to use redis for this because it has latency far lower than that of MongoDB or a SQL database.

The backend of this project was much less complicated than the front end because the main challenge of this project was the gameplay logic. 

Overall, I learned a lot about web development during this project. Writing the gameplay logic gave me a lot of practice processing through edge cases in order to ensure consistent application behavior.

