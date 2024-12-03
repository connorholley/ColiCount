const SVG_NS = "http://www.w3.org/2000/svg";
let agarBoundary = 45;
let c = { x: 50, y: 50 };

let g = document.createElementNS(SVG_NS, "g");
initializeAgar();

function initializeAgar() {
  // outer circle to simulate plastic
  let outerBorder = document.createElementNS(SVG_NS, "circle");
  outerBorder.setAttribute("cx", "50");
  outerBorder.setAttribute("cy", "50");
  outerBorder.setAttribute("r", "50");
  outerBorder.setAttribute("fill", "none");
  outerBorder.setAttribute("stroke", "lightgray");
  outerBorder.setAttribute("stroke-width", "6");
  g.appendChild(outerBorder);

  // Add the inner circle for the second border
  let innerBorder = document.createElementNS(SVG_NS, "circle");
  innerBorder.setAttribute("cx", "50");
  innerBorder.setAttribute("cy", "50");
  innerBorder.setAttribute("r", agarBoundary); // Slightly smaller radius than the outer border
  innerBorder.setAttribute("fill", "none");
  innerBorder.setAttribute("stroke", "darkgray"); // Slightly darker border for contrast
  innerBorder.setAttribute("stroke-width", "3");
  g.appendChild(innerBorder);

  // Add the agar background circle
  let backgroundCircle = document.createElementNS(SVG_NS, "circle");
  backgroundCircle.setAttribute("cx", "50");
  backgroundCircle.setAttribute("cy", "50");
  backgroundCircle.setAttribute("r", agarBoundary); // Make it large enough to cover the area
  backgroundCircle.setAttribute("fill", "lightyellow");
  backgroundCircle.setAttribute("border-style", "double");

  g.appendChild(backgroundCircle);
}

function placeColiform() {
  // generates random angle in radians
  let a = Math.random() * 2 * Math.PI;

  // generates random distance fron the center of the main circle
  let r = Math.sqrt(
    ~~(Math.random() * (agarBoundary - 2) * (agarBoundary - 2))
  );

  // x and y coordinates of the colony
  let x = c.x + r * Math.cos(a);
  let y = c.y + r * Math.sin(a);
  // draw a colony and append it to the previously created g element.
  drawCircle({ cx: x, cy: y, r: 1 }, g);
}

function drawCircle(object, parent) {
  // here we can pass an object with circle attributes and then append it to g
  // I chose to just keep it black but you can pass fill to modify color if I want to
  // expand it to make it look like certain bacterial colonies

  var circle = document.createElementNS(SVG_NS, "circle");
  for (var name in object) {
    if (object.hasOwnProperty(name)) {
      circle.setAttributeNS(null, name, object[name]);
    }
  }
  parent.appendChild(circle);
  return circle;
}
function clearAgar() {
  // part of resetting the visual for additional entries
  g.innerHTML = "";
}
//append the g element to the svg
let SVG = document.getElementById("svg");
SVG.appendChild(g);
