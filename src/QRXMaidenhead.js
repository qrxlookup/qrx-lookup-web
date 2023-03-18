// HamGridSquare.js
// Copyright 2014 Paul Brewer KI6CQ
// License:  MIT License http://opensource.org/licenses/MIT
//
// Javascript routines to convert from lat-lon to Maidenhead Grid Squares
// typically used in Ham Radio Satellite operations and VHF Contests
//
// Inspired in part by K6WRU Walter Underwood's python answer
// http://ham.stackexchange.com/a/244
// to this stack overflow question:
// How Can One Convert From Lat/Long to Grid Square
// http://ham.stackexchange.com/questions/221/how-can-one-convert-from-lat-long-to-grid-square
//

//
// 2018 Fork Stephen Houser N1SH
//
// This code supports 4 and 6 character Maidenhead (grid square) Locators.
// It does not support the 8-character extended locator strings.
// Maidenhead Locator System: https://en.wikipedia.org/wiki/Maidenhead_Locator_System
//

/* Get the Maidenhead Locator (grid square) for a given latitude and longitude.
 * 
 * The two parameters are:
 * `latitude` - floating point latitude value
 * `longitude` - floating point longitude value
 * 
 * Returns a 6-character maidenhead locator string (e.g. `FN43rq`)
 */
function gridForLatLon(latitude, longitude) {
	var UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWX'
	var LOWERCASE = UPPERCASE.toLowerCase();
	var adjLat, adjLon, 
		fieldLat, fieldLon, 
		squareLat, squareLon, 
		subLat, subLon, 
		rLat, rLon;

	// Parameter Validataion
	var lat = Math.fround(latitude);
	if (isNaN(lat)) {
		throw Error("latitude is NaN");
	}

	if (Math.abs(lat) === 90.0) {
		throw Error("grid squares invalid at N/S poles");
	}

	if (Math.abs(lat) > 90) {
		throw Error("invalid latitude: " + lat);
	}

	var lon = Math.fround(longitude);
	if (isNaN(lon)) {
		throw Error("longitude is NaN");
	}

  	if (Math.abs(lon) > 180) {
		throw Error("invalid longitude: " + lon);
	}

	// Latitude
	adjLat = lat + 90;
	fieldLat = UPPERCASE[Math.trunc(adjLat / 10)];
	squareLat = '' + Math.trunc(adjLat % 10);
	rLat = (adjLat - Math.trunc(adjLat)) * 60;
	subLat = LOWERCASE[Math.trunc(rLat / 2.5)];
	  
	// Logitude
  	adjLon = lon + 180;
  	fieldLon = UPPERCASE[Math.trunc(adjLon / 20)];
  	squareLon = ''+Math.trunc((adjLon / 2) % 10);
  	rLon = (adjLon - 2*Math.trunc(adjLon / 2)) * 60;
	subLon = LOWERCASE[Math.trunc(rLon / 5)];
	  
  	return fieldLon + fieldLat + squareLon + squareLat + subLon + subLat;
}

/* Get the latitude and longitude for a Maidenhead (grid square) Locator.
 *
 * This function takes a single string parameter that is a Maidenhead (grid
 * square) Locator. It must be 4 or 6 characters in length and of the format.
 * * 4-character: `^[A-X][A-X][0-9][0-9]$`
 * * 6-character: `^[A-X][A-X][0-9][0-9][a-x][a-x]$`
 * * 8-character: `^[A-X][A-X][0-9][0-9][a-x][a-x][0-9][0-9]$` (not supported).
 * 
 * Returns an array of floating point numbers `[latitude, longitude]`.
 */
function latLonForGrid(grid) {
	var lat = 0.0;
	var lon = 0.0;
	
	function lat4(g){
		return 10 * (g.charCodeAt(1) - 'A'.charCodeAt(0)) + parseInt(g.charAt(3)) - 90;
	}
	
	function lon4(g){
		return 20 * (g.charCodeAt(0) - 'A'.charCodeAt(0)) + 2 * parseInt(g.charAt(2)) - 180;
	}

	if ((grid.length !== 4) && (grid.length !== 6)) {
		throw Error("grid square: grid must be 4 or 6 chars: " + grid);
	}

	if (/^[A-X][A-X][0-9][0-9]$/.test(grid)) {
		// Decode 4-character grid square
		lat = lat4(grid) + 0.5;
		lon = lon4(grid) + 1;
	} else if (/^[A-X][A-X][0-9][0-9][a-x][a-x]$/.test(grid)) {
		// Decode 6-character grid square
		lat = lat4(grid) + (1.0 / 60.0) * 2.5 * (grid.charCodeAt(5) - 'a'.charCodeAt(0) + 0.5);
		lon = lon4(grid) + (1.0 / 60.0) * 5 * (grid.charCodeAt(4) - 'a'.charCodeAt(0) + 0.5);
	} else {
		throw Error("gridSquareToLatLon: invalid grid: " + grid);
	}

	return [lat, lon];
};

const QRXMaidenhead = {
    gridForLatLon,
    latLonForGrid,
};

export default QRXMaidenhead;