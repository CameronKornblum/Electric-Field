// html element implementation

let canvasElement = document.getElementById('canvas');
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;
let ctx = canvasElement.getContext('2d');
let slideValue = document.getElementById("slideValue");
let slider = document.getElementById("slider");
slider.oninput = function(){
    slideValue.innerHTML = this.value;
};
window.onmousemove=(event)=>{
    point.x = event.x;
    point.y = event.y;
};
// button functions
function chargeValue () {
    charge = slider.value;
}
function changeSign(){
    sign = sign * -1;
    charge = charge * sign;
}
function removePoint(){
    pointArray.splice(pointArray.length-1,1);
}
// initializing global variables
let vectorArray = [];
let pointArray = [];
let gridLength = 35;
let gridArea = {
    x: canvasElement.width / gridLength,
    y: canvasElement.height / gridLength
};
let sign = 1;
let q = 500;
let charge = sign*q;
let k = 2000;
let color;
let pointColor;

let point = {
    x: 0,
    y: 0
};
// initializing classes
class Point {
    constructor(x, y, size, color, charge, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.charge = charge;
        this.size = size;

        this.drawPoint = function(){
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x,this.y, this.size,0,Math.PI*2, false);
            ctx.fill();
        };
        this.update = function(){
            this.x += this.dx;
            this.y += this.dy;
        };
        this.drawPoint();


    }
    coordinate() {
        return {x: this.x,y: this.y};
    }

    }


class Vector{
    constructor (tail, tip, color, size = 20){
        this.tail = tail;
        this.tip = tip;
        this.color = color;

        this.drawArrow = function (tail, tip) {
            const {dir, mag} = toPolar(subtract(this.tip, this.tail));
            const v1 = {dir: dir + Math.PI * 0.8, mag: mag / 2};
            const p1 = toXY(v1);
            const t1 = add(p1, this.tip);
            const v2 = {dir: dir - Math.PI * 0.8, mag: mag / 2};
            const p2 = toXY(v2);
            const t2 = add(p2, this.tip);
            ctx.beginPath();
            ctx.moveTo(tail.x, tail.y);
            ctx.lineTo(tip.x, tip.y);
            ctx.strokeStyle = color;
            ctx.moveTo(tip.x, tip.y);
            ctx.lineTo(t1.x, t1.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.stroke();
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();


        };

        this.drawArrow(tip, tail);
    }

}


window.addEventListener('click', function(event){
    const element = event.target;
    if (element.tagName === 'CANVAS') {
        if (Math.sign(charge) === -1) {
            pointColor = 'hsl(' + "230" + "," + " " + "100%," + " " + "50%)";
        }
        else if (charge === 0){
            pointColor = 'hsl(' + "0" + "," + " " + "0%," + " " + "75%)"
        }
        else {
            pointColor = 'hsl(' + "0" + "," + " " + "100%," + " " + "50%)";
        }

        pointArray.push(new Point(point.x, point.y, 15, pointColor, charge, 0, 0));
        update();
    }
});


// important function for updating simulation
function update() {
    let offset = gridLength/2;
    vectorArray = [];
    let inc = [];
    let tip = {x: 0, y: 0};
    let tail = {x: 0, y: 0};
    let increase = {
        x: 0,
        y: 0
    };
    let limit = 30;
    let color = 100;
    let XY = {
        x: 0,
        y: 0
    };
    let polar;
    let fieldArray = [];
    let eField;
    let eForce;
    let forcePolar;
    let forceArray = [];
    let propertiestoSum = ['x', 'y'];
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    for (let j = 0; j < gridArea.y; j++) {
        for (let i = 0; i < gridArea.x; i++) {
            increase.x = i * gridLength;
            increase.y = j * gridLength;
            inc.push(increase);
            tail.x = offset + inc[i].x;
            tail.y = offset + inc[i].y;

                for (let n = 0; n < pointArray.length; n++) {
                    polar = toPolar(subtract(tail, pointArray[n].coordinate()));
                    eField = {
                        x: k * (pointArray[n].charge / Math.pow(polar.mag, 2))* Math.cos(polar.dir) ,
                        y: k * (pointArray[n].charge / Math.pow(polar.mag, 2))* Math.sin(polar.dir)
                    };
                    fieldArray.push(eField);
                }
                eField = sumProperties(fieldArray, propertiestoSum);
                fieldArray = [];

                tip.x = inc[i].x + eField.x + offset;
                tip.y = inc[i].y + eField.y + offset;
                polar = toPolar(subtract(tip, tail));
                XY = toXY(polar);
                if (polar.mag > 290) {
                    color = 290;
                } else {
                    color = polar.mag;
                }
                if (polar.mag > limit) {
                    polar.mag = limit;
                    XY = toXY(polar);
                    tip.x = XY.x + inc[i].x + offset;
                    tip.y = XY.y + inc[i].y + offset;
                }

                let colorArray = 'hsl(' + color.toString() + "," + " " + "100%," + " " + "50%)";

                vectorArray.push(new Vector(tip, tail, colorArray));
            }
        }
        for (let m = 0; m < pointArray.length; m++) {
            for (let n = 0; n < pointArray.length; n++) {
                if (m === n){
                    eForce = {x:0, y:0};
                    forceArray.push(eForce);
                }
                else {
                    forcePolar = toPolar(subtract(pointArray[m].coordinate(), pointArray[n].coordinate()));
                    if ((forcePolar.mag < (pointArray[m].size * 5)) && (Math.sign(pointArray[n].charge) !== Math.sign(pointArray[m].charge))){
                        pointArray[n] = new Point(pointArray[n].coordinate().x,pointArray[n].coordinate().y,20,"darkgray",0,0,0);
                        pointArray.splice(m,1);
                    }
                        else
                    {
                        eForce = {
                            x: Math.cos(forcePolar.dir) * ((pointArray[m].charge * pointArray[n].charge) / Math.pow(forcePolar.mag, 2)),
                            y: Math.sin(forcePolar.dir) * ((pointArray[m].charge * pointArray[n].charge) / Math.pow(forcePolar.mag, 2))
                        };
                        forceArray.push(eForce);
                    }
                }

            }
            eForce = sumProperties(forceArray, propertiestoSum);
            pointArray[m].dx = eForce.x;
            pointArray[m].dy = eForce.y;
            forceArray = [];
        }

    for (let n = 0; n < pointArray.length; n++) {
        pointArray[n].drawPoint();
    }
}

// arithmetic functions
function toPolar ({x,y}){
    return {
        mag: magnitude({x,y}),
        dir: direction({x,y})
    };
}
function magnitude({x,y}){
    return Math.hypot(x,y);
}
function direction({x,y}){
    return Math.atan2(y,x);
}
function toXY({mag, dir}){
    return {
        x: Math.cos(dir)*mag,
        y: Math.sin(dir)*mag
    };
}
function add(p1,p2){
    return{
        x:p1.x + p2.x,
        y:p1.y + p2.y
    }

}
function subtract(p1,p2){
    return{
        x:p1.x - p2.x,
        y:p1.y - p2.y
    };
}
function sumProperties(arr, props) {
    return arr.reduce((acc, obj) => {
        props.forEach(prop => {
            acc[prop] = (acc[prop] || 0) + obj[prop];
        });
        return acc;
    }, {});
}

function init() {
    let inc = [];
    let tip = {x:0,y:0};
    let tail = {x:0,y:0};
    let increase = 0;
    let offset = {
        x: gridLength / 2,
        y: gridLength / 2
    };

    for (let j = 0; j <= gridArea.y; j++){
        for (let i = 0; i <= gridArea.x; i++) {

            increase = i * gridLength;
            inc.push(increase);
            tail.x = offset.x + inc[i];
            tail.y = offset.y + inc[j];
            tip.x = inc[i] + offset.x;
            tip.y = inc[j];

                vectorArray.push(new Vector(tip, tail));


        }
    }
}
//initializing simulation
function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    update();
    for (let i = 0; i < pointArray.length; i++){
        pointArray[i].update();
    }

}


init();

animate();
