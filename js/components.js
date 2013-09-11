Crafty.c("Player", {
	init: function(){
		this.requires("Objekt");
	},
	shoot: function(){
		// console.log(this);
		var that = this;
		Crafty.e("Bullet")
			.attr({x: that.x, y: that.y, w: 10, type: "dynamic"})
			.fly(this.rotation+this.originalRotation*radToDec, 500);
	}
});
Crafty.c("Bullet", {
	originalRotation: 0,
	init: function(){
		this.requires("Box2D, Canvas, Color, Particles");
		this.color("#E01BC6");
		this.bind("Change", function(){
			if(this.body !== null){
				this.body.SetBullet(true);
			}
		});
		this.onHit("Box2D", function(data){
			var that = this;
			data.forEach(function(objekt){
				if(objekt.obj.__c.Objekt && !objekt.obj.__c.Player){
					// that.destroy();
					that.particles({
						maxParticles: 30,
						size: 6,
						sizeRandom: 3,
						speed: 2,
						speedRandom: 2,
						// Lifespan in frames
						lifeSpan: 15,
						lifeSpanRandom: 10,
						// Angle is calculated clockwise: 12pm is 0deg, 3pm is 90deg etc.
						angle: 0,
						angleRandom: 360,
						startColour: [255, 131, 0, 1],
						startColourRandom: [48, 50, 45, 0],
						endColour: [245, 35, 0, 0],
						endColourRandom: [60, 60, 60, 0],
						// Random spread from origin
						spread: 3,
						// How many frames should this last
						duration: 2,
						// Will draw squares instead of circle gradients
						fastMode: true,
						gravity: { x: 0, y: 0 },
						// sensible values are 0-3
						jitter: 0
					});
				}
			});
		});
	},
	fly: function(angle, speed){
		// console.log(this.body);
		// console.log(angle*decToRad);
		this.body.ApplyForce(
			new b2Vec2( 
				-Math.cos(angle*decToRad)*speed, 
				-Math.sin(angle*decToRad)*speed 
				),
			this.body.GetWorldCenter()
			);
		// this.particles({
		// 	maxParticles: 1000,
		// 	size: 10,
		// 	sizeRandom: 0,
		// 	speed: 10,
		// 	speedRandom: 0,
		// 	// Lifespan in frames
		// 	lifeSpan: 10,
		// 	lifeSpanRandom: 0,
		// 	// Angle is calculated clockwise: 12pm is 0deg, 3pm is 90deg etc.
		// 	angle: angle-90,
		// 	angleRandom: 0,
		// 	startColour: [255, 131, 0, 1],
		// 	startColourRandom: [48, 50, 45, 0],
		// 	endColour: [245, 35, 0, 0],
		// 	endColourRandom: [60, 60, 60, 0],
		// 	// Only applies when fastMode is off, specifies how sharp the gradients are drawn
		// 	sharpness: 20,
		// 	sharpnessRandom: 10,
		// 	// Random spread from origin
		// 	spread: 0,
		// 	// How many frames should this last
		// 	duration: 20,
		// 	// Will draw squares instead of circle gradients
		// 	fastMode: true,
		// 	gravity: { x: 0, y: 0 },
		// 	// sensible values are 0-3
		// 	jitter: 0
		// });
	}
})
Crafty.c("Controllable", {
	speed: 100,
	originalRotation: Math.PI/2,
	lookingTarget: new b2Vec2(),

	init: function(){
		this.requires("Keyboard");
		this.lookingTarget = new b2Vec2();
		this.bind("KeyDown", function(){
			if(this.isDown("E")) {
				// console.log(this.body.GetMass());
				this.body.ApplyTorque(147.5/180 * 90);
			}
		})
	},

	lookAt: function(x,y){
		this.lookingTarget.Set(x,y);
	},

	computeForce: function(){
		// POHYB
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
		// Crafty.viewport.x = -this.x+150;
		// Crafty.viewport.y = -this.y+150;

		// ROTACE

		// vector1 - pozice myši relativní k pozici playera
		var vec1 = new b2Vec2(this._x, this._y);
		vec1.Subtract(this.lookingTarget);
		// vector2 - playerovo aktuální natočení vyjádřený vektorem
		var currentAngle = this._rotation*Math.PI/180;
		var vec2 = new b2Vec2( -Math.cos(currentAngle+this.originalRotation), -Math.sin(currentAngle+this.originalRotation) );
		// vector3 - rovina
		var vec3 = new b2Vec2(1,0);

		var dot = vec1.x*vec2.x + vec1.y*vec2.y;
		var normalDot = vec1.y*vec2.x - vec1.x*vec2.y;
		var len = vec1.Length();
		var ang = Math.acos(dot/len);

		var uhel = Math.PI-ang;
		if(uhel > 0.03){
			// this.body.SetAngularVelocity(0)
			if(normalDot < 0){
				this.body.ApplyTorque(uhel*10);
			}
			if(normalDot > 0){
				this.body.ApplyTorque(-uhel*10);
			}
		}
		else {
			var dot2 = vec1.x*vec3.x + vec1.y*vec3.y;
			var ang2 = Math.acos(dot2/len);
			// this.body.SetAngle(ang2);
			this.body.SetAngularVelocity(0)
		}
	}
})

Crafty.c("Objekt", {
	colors: ["#E3710E","#D1813B","#DE9518","#DE5A18","#ED853B"],
	speed: 0,
	angle: 0,
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

		this.bind("EnterFrame", function(){
			this.computeForce();

			this.body.ApplyForce(
				this.setForce,
				this.body.GetWorldCenter()
				);
		});
	},
	computeForce: function(){
		var force = this.body.GetMass()*this.speed; // hustý, ono to funguje, jsem úplný fyzik
		var angle = this.angle;

		if (force == 0){
			this.setForce.SetZero(0,0);
		}
		else {
			this.setForce.Set( force*Math.cos(angle), -force*Math.sin(angle) );
		}
	}
});

Crafty.c("Objekt", {
	colors: ["#E3710E","#D1813B","#DE9518","#DE5A18","#ED853B"],
	speed: 0,
	angle: 0,
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

		this.bind("EnterFrame", function(){
			this.computeForce();

			this.body.ApplyForce(
				this.setForce,
				this.body.GetWorldCenter()
				);
		});
	},
	computeForce: function(){
		var force = this.body.GetMass()*this.speed; // hustý, ono to funguje, jsem úplný fyzik
		var angle = this.angle;

		if (force == 0){
			this.setForce.SetZero(0,0);
		}
		else {
			this.setForce.Set( force*Math.cos(angle), -force*Math.sin(angle) );
		}
	}
});