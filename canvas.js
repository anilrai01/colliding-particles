var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


var ctx = canvas.getContext('2d');

var mouse = {
    x: undefined,
    y: undefined,
}

var colorArray = [
    '#0C39A0',
    '#FF2828',
    '#CF398E',
    '#FF7E14',
    // '#FFEB14',
    // '#58E912',
];

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();
});

window.addEventListener('mousemove', function(event){
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

function randomColor(color){
    return colorArray[Math.floor(Math.random() * color.length )];
}
/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

function Particle(x,y,rad,color){
    this.x = x;
    this.y = y;
    this.velocity = {
        x: Math.random() - 0.5,
        y: Math.random() - 0.5,
    }
    this.rad = rad;
    this.mass = 1;
    // this.color = Math.floor(Math.random() * colorArray.length);
    this.color = color;
    this.opacity  = 0;

    this.draw = () => {
        ctx.beginPath();
        ctx.arc(this.x,this.y, this.rad, 0,Math.PI * 2, false);

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = this.color;
        ctx.stroke();
        // Update the Movement
        // this.update();
    }

    this.update = particleArray => {

        this.draw();

        //Collision Detection // Elastic Collision
        for(let i = 0; i < particleArray.length; i++){
            if(this === particleArray[i]) continue;

            let distance = getDistance(this.x,this.y,particleArray[i].x,particleArray[i].y);

                if(distance - (this.rad + particleArray[i].rad) <= 0){
                    
                    resolveCollision(this, particleArray[i]);

                }

        }

        if(this.x + this.rad > innerWidth || this.x - this.rad < 0){
            this.velocity.x = -this.velocity.x;
        }
        if(this.y + this.rad > innerHeight || this.y - this.rad < 0){
            this.velocity.y = -this.velocity.y;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if(getDistance(mouse.x, mouse.y, this.x, this.y) < 90 && this.opacity < 0.2){
            this.opacity += 0.02;
        }else if(this.opacity > 0){
            this.opacity -= 0.02;

            this.opacity = Math.max(0, this.opacity);
        }

    }
}

function getDistance(x1,y1,x2,y2){
    let xDistacne = x2 - x1;
    let yDistance = y2 - y1;

    return Math.sqrt(Math.pow(xDistacne, 2) + Math.pow(yDistance, 2));
}

// var ObjectArray = [];

let particleArray;

function init(){
// Creating numbers of Objects
    particleArray = [];
    for(let i = 0; i< 250; i++){

        let rad = 15;
        let x = Math.random() * (innerWidth - 2*rad) + rad;
        let y = Math.random() * (innerHeight -2*rad) + rad;
        // let dx = Math.floor(Math.random()* 5 + 1);
        // let dy = Math.floor(Math.random()* 5 + 1);
        let color = randomColor(colorArray);

        if(i !== 0){
            for(let j = 0; j<particleArray.length; j++){

                let distance = getDistance(x,y,particleArray[j].x,particleArray[j].y);

                if(distance - (rad + particleArray[j].rad) < 0){
                    
                    x = Math.random() * (innerWidth - 2*rad) + rad;
                    y = Math.random() * (innerHeight -2*rad) + rad;
                    
                    j = -1;
                }
                // console.log("J After end of loop");
                // console.log(j);
            }

        }
        
        particleArray.push(new Particle(x, y, rad, color));

    }

    console.log("Working");
}

init();

function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    particleArray.forEach(particles => {
        particles.update(particleArray);
    });

}

animate();