// Megan Cater
// @megancater
// February 17, 2022
// nd-clock.js

"use strict";

var canvas;
var gl;
var vertices;

var theta = 0;
var u_baseColorLoc;
var u_ctMatrixLoc;

// transformation matrices
var outerMat, innerMat, centerMat, logoMat, hourMat, minuteMat, secondMat;
var hourMarkersMats = [];
var minuteMarkersMats = [];

// colors
var gold = vec3(201/255, 151/255, 0/255);
var blue = vec3(12/255, 35/255, 64/255);
var white = vec3(1.0, 1.0, 1.0);
var black = vec3(0.0, 0.0, 0.0);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    
    /* Vertices for the circles */
    
    var p = vec3(0.0, 0.0, 0.0); // center of the circle
    vertices = [ p ];
    
    // Add vertices for around the circle to be used in triangle fan
    for (var i = 0; i < 2*Math.PI; i += 2*Math.PI/72) {
        vertices.push(vec3(Math.cos(i), Math.sin(i), 0.0));
    }
    
    /* Vertices for the ND logo */
    // 52 vertices
    // vertices[0][0] = -0.622973333333
    // vertices[0][1] = 0.828643333333
    var points = [[-0.622973333333,0.828643333333], // 0
                    [-0.266306666667,0.828643333333],
                    [-0.06964,0.51531],
                    [0.407026666667,0.51531],
                    [0.407026666667,0.591976666667],
                    [0.277026666667,0.59531],
                    [0.277026666667,0.828643333333],
                    [0.777026666667,0.828643333333],
                    [0.777026666667,0.59531],
                    [0.64036,0.594133333333],
                    [0.64036,0.517466666667],
                    [0.767026666667,0.508643333333],
                    [0.943693333333,0.32531],
                    [0.95036,-0.28469],
                    [0.76036,-0.478023333333],
                    [0.637026666667,-0.481356666667],
                    [0.637026666667,-0.81469],
                    [0.40036,-0.818023333333],
                    [0.20036,-0.481356666667],
                    [-0.262973333333,-0.478023333333],
                    [-0.262973333333,-0.601356666667],
                    [-0.142973333333,-0.608023333333],
                    [-0.142973333333,-0.81469],
                    [-0.622973333333,-0.818023333333],
                    [-0.622973333333,-0.608023333333],
                    [-0.472973333333,-0.60018],
                    [-0.472973333333,-0.48018],
                    [-0.926306666667,-0.478023333333],
                    [-0.926306666667,-0.281356666667],
                    [-0.80964,-0.27469],
                    [-0.80964,0.301976666667],
                    [-0.926306666667,0.308643333333],
                    [-0.926306666667,0.50531],
                    [-0.46964,0.51531],
                    [-0.46964,0.591976666667],
                    [-0.622973333333,0.591976666667],
                    [-0.58964,0.30531],
                    [-0.47616,0.30531],
                    [-0.47616,-0.278023333333],
                    [-0.58964,-0.271356666667],
                    [-0.259493333333,0.301976666667],
                    [0.0805066666667,-0.278023333333],
                    [-0.259493333333,-0.27469],
                    [0.0570266666667,0.301976666667],
                    [0.407173333333,0.301976666667],
                    [0.407173333333,-0.27469],
                    [0.637173333333,0.30531],
                    [0.70036,0.30531],
                    [0.76036,0.23531],
                    [0.757026666667,-0.218023333333],
                    [0.70036,-0.281356666667],
                    [0.63384,-0.27469] // 51
                    ];
    
    // 32 triangles that compose the ND logo
    var indices = [0, 1, 34,
              0, 34, 35,
              1, 2, 34,
              2, 33, 34,
              3, 4, 10,
              4, 9, 10,
              5, 6, 8,
              6, 7, 8,
              11, 12, 48,
              11, 32, 47,
              11, 47, 48,
              12, 13, 48,
              13, 14, 49,
              13, 48, 49,
              14, 27, 50,
              14, 49, 50,
              15, 16, 17,
              15, 17, 18,
              19, 20, 26,
              20, 25, 26,
              21, 22, 24,
              22, 23, 24,
              27, 28, 50,
              29, 30, 39,
              30, 36, 39,
              31, 32, 47,
              37, 38, 42,
              37, 40, 42,
              40, 41, 43,
              41, 43, 45,
              44, 45, 51,
              44, 46, 51];
    
    // add the vertices for the triangles to the array
    for (var i = 0; i < indices.length; i++) {
        vertices.push(vec3(points[indices[i]][0], points[indices[i]][1], 0.0));
    }
    
    // The borders of the ND logo consist of vertices 0-35, 36-39, 40-42, 43-45, and 46-51
    // add the vertices for the borders to the array
    for (var i = 0; i < points.length; i++) {
        vertices.push(vec3(points[i][0], points[i][1], 0.0));
    }
    
    /* Vertices for all rectangular objects */
    vertices.push(vec3(0.5, 0.5, 0.0));
    vertices.push(vec3(-0.5, 0.5, 0.0));
    vertices.push(vec3(-0.5, -0.5, 0.0));
    vertices.push(vec3(0.5, -0.5, 0.0));
    
    // Load the data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var a_vPositionLoc = gl.getAttribLocation( program, "a_vPosition" );
    gl.vertexAttribPointer( a_vPositionLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vPositionLoc );

    u_baseColorLoc = gl.getUniformLocation( program, "u_baseColor" );

    // Associate current transformation matrix
    u_ctMatrixLoc = gl.getUniformLocation(program, "u_ctMatrix");

    // Set up the matrices for each element to be drawn
    setupMats();

    render();
};

function setupMats() {
    // Scaling factors for the outer, inner, and center circles and the ND logo
    var scaling_outer = 0.8;
    var scaling_inner = 0.75;
    var scaling_center = 0.025;
    var scaling_logo = 0.4;

    var tm, sm, rm; // translation, scaling, rotation

    /* Outer Circle */
    
    // construct modelview matrix
    tm = translate(0.0, 0.0, 0.0);
    rm = rotateZ(theta);
    sm = scalem(scaling_outer, scaling_outer, 1.0);
    
    // object instancing
    outerMat = mult(rm, mult(tm, sm));

    // use orthogonal projection, construct mvp matrix
    var pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    outerMat = mult(pm, outerMat);
    
    
    /* Inner Circle */

    // construct modelview matrix
    sm = scalem(scaling_inner, scaling_inner, 1.0);
    
    // object instancing
    innerMat = mult(rm, mult(tm, sm));

    // use orthogonal projection, construct mvp matrix
    innerMat = mult(pm, innerMat);
    
    
    /* ND Logo */
    
    // construct modelview matrix
    sm = scalem(scaling_logo, scaling_logo, 1.0);
    
    // object instancing
    logoMat = mult(rm, mult(tm, sm));

    // use orthogonal projection, construct mvp matrix
    logoMat = mult(pm, logoMat);
    
    
    /* Center Circle */

    // construct modelview matrix
    sm = scalem(scaling_center, scaling_center, 1.0);
    
    // object instancing
    centerMat = mult(rm, mult(tm, sm));

    // use orthogonal projection, construct mvp matrix
    centerMat = mult(pm, centerMat);
    
    
    /* Markers */
    
    var temp;
    for (var deg = 0; deg < 360; deg += 6) {
        // hour marker
        if (deg % 30 == 0) {
            // translate the marker
            tm = translate(0.70 * Math.cos(deg * Math.PI / 180), 0.70 * Math.sin(deg * Math.PI / 180), 0.0)
            
            // scale the marker
            sm = scalem(0.1, 0.02, 1.0);
            
            // rotate the marker
            rm = rotateZ(deg);

            // object instancing
            temp = mult(tm, mult(rm, sm));

            // use orthogonal projection, construct mvp matrix
            hourMarkersMats.push(mult(pm, temp));
        }
        
        // minute marker
        else {
            // translate the marker
            tm = translate(0.725 * Math.cos(deg * Math.PI / 180), 0.725 * Math.sin(deg * Math.PI / 180), 0.0)
            
            // scale the marker
            sm = scalem(0.05, 0.015, 1.0);
            
            // rotate the marker
            rm = rotateZ(deg);

            // object instancing
            temp = mult(tm, mult(rm, sm));

            // use orthogonal projection, construct mvp matrix
            minuteMarkersMats.push(mult(pm, temp));
        }
    }
}

function updateTime() {
    // Get the current time
    var now = new Date();
    var seconds = now.getSeconds();
    var minutes = now.getMinutes() + seconds/60;
    var hours = now.getHours() + minutes/60;
    
    // If the hour is greater than 12, reset it to 0-11 hours
    if (hours >= 12) {
        hours -= 12;
    }
    
    
    // Setup hour, minute, and second hands
    
    var tm, sm, rm; // translation, scaling, rotation
    var pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    
    
    /* Second Hand */
    
    // scale the hand
    sm = scalem(0.6, 0.01, 1.0);
    
    // determine degree of the second hand
    var degSeconds;
    if (seconds <= 15) {
        degSeconds = (1 - seconds/15) * 90;
    }
    else {
        degSeconds = 90 + (1 - seconds/60) * 360;
    }
    
    // translate the hand
    tm = translate(0.3 * Math.cos(degSeconds * Math.PI / 180), 0.3 * Math.sin(degSeconds * Math.PI / 180), 0.0);
        
    // rotate the hand
    rm = rotateZ(degSeconds);

    // object instancing
    secondMat = mult(tm, mult(rm, sm));

    // use orthogonal projection, construct mvp matrix
    secondMat = mult(pm, secondMat);
    
    
    /* Minute Hand */
    
    // scale the hand
    sm = scalem(0.45, 0.015, 1.0);
    
    // determine the degree of the minute hand
    var degMinutes;
    if (minutes <= 15) {
        degMinutes = (1 - minutes/15) * 90;
    }
    else {
        degMinutes = 90 + (1 - minutes/60) * 360;
    }
    
    // translate the hand
    tm = translate(0.225 * Math.cos(degMinutes * Math.PI / 180), 0.225 * Math.sin(degMinutes * Math.PI / 180), 0.0);
        
    // rotate the hand
    rm = rotateZ(degMinutes);

    // object instancing
    minuteMat = mult(tm, mult(rm, sm));

    // use orthogonal projection, construct mvp matrix
    minuteMat = mult(pm, minuteMat);
    
    
    /* Hour Hand */
    
    // scale the hand
    sm = scalem(0.35, 0.02, 1.0);
    
    // determine the degree of the hour hand
    var degHours;
    if (hours <= 3) {
        degHours = (1 - hours/3) * 90;
    }
    else {
        degHours = 90 + (1 - hours/12) * 360;
    }
    
    // translate the hand
    tm = translate(0.175 * Math.cos(degHours * Math.PI / 180), 0.175 * Math.sin(degHours * Math.PI / 180), 0.0);
        
    // rotate the hand
    rm = rotateZ(degHours);

    // object instancing
    hourMat = mult(tm, mult(rm, sm));

    // use orthogonal projection, construct mvp matrix
    hourMat = mult(pm, hourMat);
}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    /* Outer Circle */
    
    // gold
    gl.uniform3fv( u_baseColorLoc, gold );
    
    // send ctm to GPU
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(outerMat));

    // draw the outer circle
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 74 );
    
    
    /* Inner Circle */

    // white
    gl.uniform3fv( u_baseColorLoc, white );
    
    // send ctm to GPU
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(innerMat));

    // draw the inner circle
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 74 );
    
    
    /* ND Logo */

    // blue
    gl.uniform3fv( u_baseColorLoc, blue );
    
    // send ctm to GPU
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(logoMat));

    // draw the ND logo
    gl.drawArrays( gl.TRIANGLES, 74, 96 );
    
    // black
    gl.uniform3fv( u_baseColorLoc, black );
    
    // draws each part of the border of the logo
    gl.drawArrays( gl.LINE_LOOP, 170, 36);
    gl.drawArrays( gl.LINE_LOOP, 206, 4);
    gl.drawArrays( gl.LINE_LOOP, 210, 3);
    gl.drawArrays( gl.LINE_LOOP, 213, 3);
    gl.drawArrays( gl.LINE_LOOP, 216, 6);
    
    
    /* Center Circle */

    // gold
    gl.uniform3fv( u_baseColorLoc, gold );
    
    // send ctm to GPU
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(centerMat));

    // draw the center circle
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 74 );
    
    
    /* Markers */
    
    // blue
    gl.uniform3fv( u_baseColorLoc, blue );
    
    // determine which marker is being drawn and draw it
    var hourCount = 0;
    var minuteCount = 0;
    for (var i = 0; i < hourMarkersMats.length + minuteMarkersMats.length; i++) {
        // hour markers
        if (i % 5 == 0) {
            // send ctm to GPU
            gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(hourMarkersMats[hourCount]));
            hourCount++;
        }
        
        // minute markers
        else {
            // send ctm to GPU
            gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(minuteMarkersMats[minuteCount]));
            minuteCount++;
        }

        // draw the marker
        gl.drawArrays( gl.TRIANGLE_FAN, 222, 4 );
    }
    
    
    // updates the time and associated matrices
    updateTime();
    
    
    /* Second Hand */
    
    // gold
    gl.uniform3fv( u_baseColorLoc, gold );
    
    // send ctm to GPU
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(secondMat));

    // draw the second hand
    gl.drawArrays( gl.TRIANGLE_FAN, 222, 4 );
    
    
    /* Minute Hand */
    
    // send ctm to GPU
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(minuteMat));

    // draw the minute hand
    gl.drawArrays( gl.TRIANGLE_FAN, 222, 4 );
    
    
    /* Hour Hand */
    
    // send ctm to GPU
    gl.uniformMatrix4fv(u_ctMatrixLoc, false, flatten(hourMat));

    // draw the hour hand
    gl.drawArrays( gl.TRIANGLE_FAN, 222, 4 );

    window.requestAnimFrame(render);
}
