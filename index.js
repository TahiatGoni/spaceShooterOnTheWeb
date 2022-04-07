const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

var lives = 3;
var score = 0;


c.fillRect(0,0, canvas.width, canvas.height);
c.font = "30px Arial";
c.fillStyle = 'white';
c.fillText("Press Space to Start!", 400, 250); 

var lasers = [];
var asteroids = [];
var spawnCounter = 0;
var accelerationCounter = 0;
var spawnVelocity = 0;

class Sprite {
	constructor({position, dimensions, imageSrc}) {
		this.position = position;
		
		this.dimensions = dimensions;
		this.image = new Image();
		this.image.src = imageSrc;
	}

	draw() {
		c.drawImage(this.image, this.position.x, this.position.y);
	}

	update() {
		this.draw();
	}

}


const background = new Sprite( {
	position: {
		x:0,
		y:0,
	},
	dimensions: {
		width: canvas.width,
		height: canvas.height,
	},
	imageSrc: './Resources/sprites/background.jpg',
});



class LaserBeam extends Sprite {
	constructor({position, velocity, dimensions, imageSrc}) {
		super({position, dimensions, imageSrc});
		this.velocity = velocity;
		this.acceleration = 0.025;
	}

	update() {

		this.draw();
		this.velocity += this.acceleration;
		this.position.x += this.velocity;
		
	}

	outOfBounds() {
		return this.position.x > canvas.width;
	}
}



class PlayerSprite extends Sprite {

	constructor({position, velocity, dimensions, imageSrc}) {
		super({position, dimensions, imageSrc});
		this.velocity = velocity;
		this.acceleration = 0.025;
		this.halt_flag = true;
		this.direction = "up";
	}


	update() {
		super.update();


		this.handleHalt();
		this.handleMove();
	}


	moveUp() {
		if(this.direction == "down"){
			this.velocity = 0;
		}

		this.direction = "up";
		this.halt_flag = false;
	}

	moveDown() {
		if(this.direction == "up"){
			this.velocity = 0;
		}

		this.direction = "down";
		this.halt_flag = false;
	}

	handleMove() {
		if(!this.halt_flag){

			
			switch(this.direction) {
				case "up":
					if(!this.checkCollisionUp()){
						this.velocity -= this.acceleration;
						this.position.y += this.velocity;
					}
					break;
				case "down":
					if(!this.checkCollisionDown()){
						this.velocity += this.acceleration;
						this.position.y += this.velocity;
					}
					break;
			}
		}
	}


	handleHalt() {
		if(this.halt_flag){
			if((this.velocity * this.velocity) > 0.1) {

				switch(this.direction) {
					case "up":
						if(!this.checkCollisionUp()){
							this.velocity += this.acceleration;
							this.position.y += this.velocity;
						}
						else{
							this.velocity = 0;
						}
						break;
					case "down":
						if(!this.checkCollisionDown()){
							this.velocity -= this.acceleration;
							this.position.y += this.velocity;
						}
						else{
							this.velocity = 0;
						}
						break;
				}	
			}
			else {
				this.velocity = 0;
			}
		}
	}


	haltUp() {
		this.halt_flag = true;
		this.direction = "up";
	}

	haltDown() {
		this.halt_flag = true;
		this.direction = "down";
	}

	checkCollisionUp() {
		return (this.position.y <= 0);
	}

	checkCollisionDown() {
		return (this.position.y+this.dimensions.height >= canvas.height);
	}

	shoot() {
		lasers.push(new LaserBeam(
				{
					position: { x: player.position.x + player.dimensions.width + 0.5,
						y: player.position.y + player.dimensions.height/2,
					},
					velocity: 2,

					dimensions: { height: 5,

					width: 15,
					},
				imageSrc: './Resources/sprites/shot.png'
				}
			));
	}

}


class Asteroid extends Sprite{
	constructor({position, velocity, dimensions, imageSrc}) {
		super({position, dimensions, imageSrc});
		this.velocity = velocity;
		this.acceleration = -0.001;
	}	

	update() {

		this.draw();
		this.velocity += this.acceleration;
		this.position.x += this.velocity;
		
	}

	outOfBounds() {
		return this.position.x < 0;
	}


	checkCollision(bullet) {

		if(bullet == null){
			return false;
		}

		//long condition so using return statements
		if((bullet.position.x + bullet.dimensions.width/2) > this.position.x && (bullet.position.x + bullet.dimensions.width/2) < (this.position.x + this.dimensions.width)){
			if((bullet.position.y + bullet.dimensions.height/2) > this.position.y && (bullet.position.y + bullet.dimensions.height/2) < (this.position.y + this.dimensions.height)){
				return true;	
			}
		}
		return false;
	}
}






const player = new PlayerSprite(
	{
	position: { x: 10,
				y: 0,
			},
	velocity: 0,

	dimensions: { height: 32,

				width: 64,
			},
	imageSrc: './Resources/sprites/player.png'
	}
);

player.draw();



function animate() {
	c.fillStyle = 'black';
	c.fillRect(0,0, canvas.width, canvas.height);
	if(lives === 0) {
		c.font = "30px Arial";
		c.fillStyle = 'white';
		c.fillText("Game Over!", 430, 250); 
		return;
	}
	window.requestAnimationFrame(animate);
	background.draw();
	player.update();

	
	for(let i = 0; i < lasers.length; i++){
		
	}


	for(let i = 0; i < lasers.length; i++){
		if(lasers[i].outOfBounds()){
			lasers.splice(i, 1);
		}
		else{
			lasers[i].update();
		}

		

		
	}

	for(let i = 0; i < asteroids.length; i++){
		if(asteroids[i].outOfBounds()){
			asteroids.splice(i, 1);
			
			if(lives >= 1){
				lives -= 1;
				document.querySelector("#lives").innerHTML = "Lives : " + lives;
			}
			

			console.log("hit");
		}
		else{
			asteroids[i].update();
		}
	}

	if(spawnCounter < 250){
		spawnCounter++;
	}
	else{
		spawnCounter = 0;
		var asteroid = new Asteroid(
		{
			position: {
				x: 1024,
				y: (Math.random() * (canvas.height - 100)),
			},

			velocity: spawnVelocity,

			dimensions: {
				height: 27,
				width: 53,
			},
			imageSrc: './Resources/sprites/enemy.png',
		}

		);

		asteroids.push(asteroid);
	}


	if(accelerationCounter < 500){
		accelerationCounter++;
	}
	else{
		accelerationCounter = 0;
		spawnVelocity += 0.001; 
	}


	for(let i = 0; i < lasers.length; i++){
		for(let k = 0; k < asteroids.length; k++) {
			if(asteroids[k].checkCollision(lasers[i])){
				asteroids.splice(k,1);
				lasers.splice(i,1);
				console.log("hit");
				score += 50;
				document.querySelector('#score').innerHTML = 'Score: ' + score;
			}
		}
	}
}



window.addEventListener('keydown', (event)=> {


	switch(event.key) {
		case 's':
			player.moveDown();
			break;

		case 'w':
			player.moveUp();
			break;

		case ' ':
			animate();
			break;
	}

});

window.addEventListener('keyup', (event)=> {

	switch(event.key) {
		case 's':
			player.haltDown();
			break;

		case 'w':
			player.haltUp();
			break;
	}
});

window.addEventListener('click', (event)=> {
	if(event.button === 0){
		player.shoot();
		console.log("shot");
	}
});