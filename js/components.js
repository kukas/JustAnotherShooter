Crafty.c("Controllable", {
	speed: 100,

	init: function(){
		this.requires("Keyboard");

		this.bind("EnterFrame", function(){
			this.computeForce();

			this.body.ApplyForce(
				this.setForce,
				this.body.GetWorldCenter()
				);
		});
	},

	computeForce: function(){
		var x = 0;
		var y = 0;

		// var force = 100; // fixovaná síla, na prd
		var force = this.body.GetMass()*this.speed; // hustý, ono to funguje, jsem úplný fyzik
		var angle = 0;

		var quarterpi	= Math.PI/4;
		var halfpi		= Math.PI/2;

		if (this.isDown('UP_ARROW') || this.isDown('W')) 	y++;
		if (this.isDown('DOWN_ARROW') || this.isDown('S'))	y--;
		if (this.isDown('LEFT_ARROW') || this.isDown('A')) 	x--;
		if (this.isDown('RIGHT_ARROW') || this.isDown('D')) x++;

		if(x < 0){
			angle = Math.PI;
			angle -= y * quarterpi;
		}
		else if(x == 0){
			angle += y * halfpi;
		}
		else if(x > 0){
			angle += y * quarterpi;
		}
		if (x == 0 && y == 0){
			this.setForce.SetZero(0,0);
		}
		else {
			this.setForce.Set( force*Math.cos(angle), -force*Math.sin(angle) );
		}
	}
})

Crafty.c("Objekt", {
	colors: ["#E3710E","D1813B","DE9518","DE5A18","ED853B"],
	init: function(){
		this.requires("Box2D, Canvas, Color");
		this.color(this.colors[randInt(0,this.colors.length-1)]);
		this.setForce = new b2Vec2();

		this.bind("Change", function(){
			if(this.body !== null){
				this.body.SetLinearDamping(4);
				this.body.SetAngularDamping(4);
				// 4 jsou světové strany, 4 jsou lidské temperamenty, 4 je damping podobný reálnému světu
			}
		});
	},
});