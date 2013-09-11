function randInt(min,max){
	return min + Math.floor(Math.random()*(max-min));
}

function rand(min,max){
	return min + Math.random()*(max-min);
}

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var decToRad = Math.PI/180;
var radToDec = 180/Math.PI;