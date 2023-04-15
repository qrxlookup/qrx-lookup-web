const appVersion = '1.1-beta';

const locales = {
    pt: 'pt-PT',
    en: 'en-US',
}

const OpenStreetMapTileLayer = {
    
    default: {
        attrib: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    },

    stamen: {                
        attrib: 'Pin PNGs <a href="https://www.vecteezy.com/free-png/location">by Vecteezy</a> - Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
        maxZoom: 14,
    },
};

// Remaining air time when some action is needed
const criticalAirTime = 10;

// Extra minutes each air time increased
const extraAirTime = 30;

// Lesser minutes each air time is decreased
const lessAirTime = -15;

// Minutes an expired sessions will remain visible
const ghostAirTime = 60 * 24;

// Maximum number of radios per session
const maxRadios = 4;

// Acepted similarity between two callsigns
const similarityPct = 0.90;

const bands = [
    { label: "PMR",      value: "pmr.70cm-fm", range: {urban: 1,   rural: 3 }, offset: 500,  fontColor: 'green',  pinIcon: "/img/vecteezy-map-pin-green.png"  },
    { label: "CB | USB", value: "cb.11m-usb",  range: {urban: 20,  rural: 50}, offset: 5000, fontColor: 'blue',   pinIcon: "/img/vecteezy-map-pin-blue.png"   },
    { label: "CB | LSB", value: "cb.11m-lsb",  range: {urban: 20,  rural: 50}, offset: 5000, fontColor: 'blue',   pinIcon: "/img/vecteezy-map-pin-blue.png"   },
    { label: "CB | AM",  value: "cb.11m-am",   range: {urban: 5,   rural: 10}, offset: 2500, fontColor: 'blue',   pinIcon: "/img/vecteezy-map-pin-blue.png"   },
    { label: "CB | FM",  value: "cb.11m-fm",   range: {urban: 5,   rural: 10}, offset: 2500, fontColor: 'blue',   pinIcon: "/img/vecteezy-map-pin-blue.png"   },
    { label: "LPD",      value: "lpd.70cm-fm", range: {urban: 0.5, rural: 1 }, offset: 250,  fontColor: 'purple', pinIcon: "/img/vecteezy-map-pin-lilac.png"  }
];

const bandFrequencies = [
    { label: "CH-01", value: "433.075", link: "lpd.70cm-fm" },
    { label: "CH-02", value: "433.100", link: "lpd.70cm-fm" },
    { label: "CH-03", value: "433.125", link: "lpd.70cm-fm" },
    { label: "CH-04", value: "433.150", link: "lpd.70cm-fm" },
    { label: "CH-05", value: "433.175", link: "lpd.70cm-fm" },
    { label: "CH-06", value: "433.200", link: "lpd.70cm-fm" },
    { label: "CH-07", value: "433.225", link: "lpd.70cm-fm" },
    { label: "CH-08", value: "433.250", link: "lpd.70cm-fm" },
    { label: "CH-09", value: "433.275", link: "lpd.70cm-fm" },
    { label: "CH-10", value: "433.300", link: "lpd.70cm-fm" },
    { label: "CH-11", value: "433.325", link: "lpd.70cm-fm" },
    { label: "CH-12", value: "433.350", link: "lpd.70cm-fm" },
    { label: "CH-13", value: "433.375", link: "lpd.70cm-fm" },
    { label: "CH-14", value: "433.400", link: "lpd.70cm-fm" },
    { label: "CH-15", value: "433.425", link: "lpd.70cm-fm" },
    { label: "CH-16", value: "433.450", link: "lpd.70cm-fm" },
    { label: "CH-17", value: "433.475", link: "lpd.70cm-fm" },
    { label: "CH-18", value: "433.500", link: "lpd.70cm-fm" },
    { label: "CH-19", value: "433.525", link: "lpd.70cm-fm" },
    { label: "CH-20", value: "433.550", link: "lpd.70cm-fm" },
    { label: "CH-21", value: "433.575", link: "lpd.70cm-fm" },
    { label: "CH-22", value: "433.600", link: "lpd.70cm-fm" },
    { label: "CH-23", value: "433.625", link: "lpd.70cm-fm" },
    { label: "CH-24", value: "433.650", link: "lpd.70cm-fm" },
    { label: "CH-25", value: "433.675", link: "lpd.70cm-fm" },
    { label: "CH-26", value: "433.700", link: "lpd.70cm-fm" },
    { label: "CH-27", value: "433.725", link: "lpd.70cm-fm" },
    { label: "CH-28", value: "433.750", link: "lpd.70cm-fm" },
    { label: "CH-29", value: "433.775", link: "lpd.70cm-fm" },
    { label: "CH-30", value: "433.800", link: "lpd.70cm-fm" },
    { label: "CH-31", value: "433.825", link: "lpd.70cm-fm" },
    { label: "CH-32", value: "433.850", link: "lpd.70cm-fm" },
    { label: "CH-33", value: "433.875", link: "lpd.70cm-fm" },
    { label: "CH-34", value: "433.900", link: "lpd.70cm-fm" },
    { label: "CH-35", value: "433.925", link: "lpd.70cm-fm" },
    { label: "CH-36", value: "433.950", link: "lpd.70cm-fm" },
    { label: "CH-37", value: "433.975", link: "lpd.70cm-fm" },
    { label: "CH-38", value: "434.000", link: "lpd.70cm-fm" },
    { label: "CH-39", value: "434.025", link: "lpd.70cm-fm" },
    { label: "CH-40", value: "434.050", link: "lpd.70cm-fm" },
    { label: "CH-41", value: "434.075", link: "lpd.70cm-fm" },
    { label: "CH-42", value: "434.100", link: "lpd.70cm-fm" },
    { label: "CH-43", value: "434.125", link: "lpd.70cm-fm" },
    { label: "CH-44", value: "434.150", link: "lpd.70cm-fm" },
    { label: "CH-45", value: "434.175", link: "lpd.70cm-fm" },
    { label: "CH-46", value: "434.200", link: "lpd.70cm-fm" },
    { label: "CH-47", value: "434.225", link: "lpd.70cm-fm" },
    { label: "CH-48", value: "434.250", link: "lpd.70cm-fm" },
    { label: "CH-49", value: "434.275", link: "lpd.70cm-fm" },
    { label: "CH-50", value: "434.300", link: "lpd.70cm-fm" },
    { label: "CH-51", value: "434.325", link: "lpd.70cm-fm" },
    { label: "CH-52", value: "434.350", link: "lpd.70cm-fm" },
    { label: "CH-53", value: "434.375", link: "lpd.70cm-fm" },
    { label: "CH-54", value: "434.400", link: "lpd.70cm-fm" },
    { label: "CH-55", value: "434.425", link: "lpd.70cm-fm" },
    { label: "CH-56", value: "434.450", link: "lpd.70cm-fm" },
    { label: "CH-57", value: "434.475", link: "lpd.70cm-fm" },
    { label: "CH-58", value: "434.500", link: "lpd.70cm-fm" },
    { label: "CH-59", value: "434.525", link: "lpd.70cm-fm" },
    { label: "CH-60", value: "434.550", link: "lpd.70cm-fm" },
    { label: "CH-61", value: "434.575", link: "lpd.70cm-fm" },
    { label: "CH-62", value: "434.600", link: "lpd.70cm-fm" },
    { label: "CH-63", value: "434.625", link: "lpd.70cm-fm" },
    { label: "CH-64", value: "434.650", link: "lpd.70cm-fm" },
    { label: "CH-65", value: "434.675", link: "lpd.70cm-fm" },
    { label: "CH-66", value: "434.700", link: "lpd.70cm-fm" },
    { label: "CH-67", value: "434.725", link: "lpd.70cm-fm" },
    { label: "CH-68", value: "434.750", link: "lpd.70cm-fm" },
    { label: "CH-69", value: "434.775", link: "lpd.70cm-fm" },
    
    { label: "CH-01 | 446.00625 MHz", value: "446.00625", link: "pmr.70cm-fm" },
    { label: "CH-02 | 446.01875 MHz", value: "446.01875", link: "pmr.70cm-fm" },
    { label: "CH-03 | 446.03125 MHz", value: "446.03125", link: "pmr.70cm-fm" },
    { label: "CH-04 | 446.04375 MHz", value: "446.04375", link: "pmr.70cm-fm" },
    { label: "CH-05 | 446.05625 MHz", value: "446.05625", link: "pmr.70cm-fm" },
    { label: "CH-06 | 446.06875 MHz", value: "446.06875", link: "pmr.70cm-fm" },
    { label: "CH-07 | 446.08125 MHz", value: "446.08125", link: "pmr.70cm-fm" },
    { label: "CH-08 | 446.09375 MHz", value: "446.09375", link: "pmr.70cm-fm" },
    { label: "CH-09 | 446.10625 MHz", value: "446.10625", link: "pmr.70cm-fm" },
    { label: "CH-10 | 446.11875 MHz", value: "446.11875", link: "pmr.70cm-fm" },
    { label: "CH-11 | 446.13125 MHz", value: "446.13125", link: "pmr.70cm-fm" },
    { label: "CH-12 | 446.14375 MHz", value: "446.14375", link: "pmr.70cm-fm" },
    { label: "CH-13 | 446.15625 MHz", value: "446.15625", link: "pmr.70cm-fm" },
    { label: "CH-14 | 446.16875 MHz", value: "446.16875", link: "pmr.70cm-fm" },
    { label: "CH-15 | 446.18125 MHz", value: "446.18125", link: "pmr.70cm-fm" },
    { label: "CH-16 | 446.19375 MHz", value: "446.19375", link: "pmr.70cm-fm" },

    { label: "CH-01 | 26.965 MHz", value: "26.965", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-02 | 26.975 MHz", value: "26.975", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-03 | 26.985 MHz", value: "26.985", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-04 | 27.005 MHz", value: "27.005", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-05 | 27.015 MHz", value: "27.015", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-06 | 27.025 MHz", value: "27.025", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-07 | 27.035 MHz", value: "27.035", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-08 | 27.055 MHz", value: "27.055", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-09 | 27.065 MHz", value: "27.065", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-10 | 27.075 MHz", value: "27.075", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-11 | 27.085 MHz", value: "27.085", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-12 | 27.105 MHz", value: "27.105", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-13 | 27.115 MHz", value: "27.115", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-14 | 27.125 MHz", value: "27.125", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-15 | 27.135 MHz", value: "27.135", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-16 | 27.155 MHz", value: "27.155", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-17 | 27.165 MHz", value: "27.165", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-18 | 27.175 MHz", value: "27.175", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-19 | 27.185 MHz", value: "27.185", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-20 | 27.205 MHz", value: "27.205", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-21 | 27.215 MHz", value: "27.215", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-22 | 27.225 MHz", value: "27.225", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-23 | 27.255 MHz", value: "27.255", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-24 | 27.235 MHz", value: "27.235", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-25 | 27.245 MHz", value: "27.245", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-26 | 27.265 MHz", value: "27.265", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-27 | 27.275 MHz", value: "27.275", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-28 | 27.285 MHz", value: "27.285", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-29 | 27.295 MHz", value: "27.295", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-30 | 27.305 MHz", value: "27.305", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-31 | 27.315 MHz", value: "27.315", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-32 | 27.325 MHz", value: "27.325", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-33 | 27.335 MHz", value: "27.335", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-34 | 27.345 MHz", value: "27.345", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-35 | 27.355 MHz", value: "27.355", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-36 | 27.365 MHz", value: "27.365", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-37 | 27.375 MHz", value: "27.375", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-38 | 27.385 MHz", value: "27.385", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-39 | 27.395 MHz", value: "27.395", link: "cb.11m-am-fm-lsb-usb" },
    { label: "CH-40 | 27.405 MHz", value: "27.405", link: "cb.11m-am-fm-lsb-usb" },
];

const CTCSSFrequencies = [
    { label:  "67.0 Hz", value:  "67.0" },
    { label:  "69.3 Hz", value:  "69.3" },
    { label:  "71.9 Hz", value:  "71.9" },
    { label:  "74.4 Hz", value:  "74.4" },
    { label:  "77.0 Hz", value:  "77.0" },
    { label:  "79.7 Hz", value:  "79.7" },
    { label:  "82.5 Hz", value:  "82.5" },
    { label:  "85.4 Hz", value:  "85.4" },
    { label:  "88.5 Hz", value:  "88.5" },
    { label:  "91.5 Hz", value:  "91.5" },
    { label:  "94.8 Hz", value:  "94.8" },
    { label:  "97.4 Hz", value:  "97.4" },
    { label: "100.0 Hz", value: "100.0" },
    { label: "103.5 Hz", value: "103.5" },
    { label: "107.2 Hz", value: "107.2" },
    { label: "110.9 Hz", value: "110.9" },
    { label: "114.8 Hz", value: "114.8" },
    { label: "118.8 Hz", value: "118.8" },
    { label: "123.0 Hz", value: "123.0" },
    { label: "127.3 Hz", value: "127.3" },
    { label: "131.8 Hz", value: "131.8" },
    { label: "136.5 Hz", value: "136.5" },
    { label: "141.3 Hz", value: "141.3" },
    { label: "146.2 Hz", value: "146.2" },
    { label: "151.4 Hz", value: "151.4" },
    { label: "156.7 Hz", value: "156.7" },
    { label: "159.8 Hz", value: "159.8" },
    { label: "162.2 Hz", value: "162.2" },
    { label: "165.5 Hz", value: "165.5" },
    { label: "167.9 Hz", value: "167.9" },
    { label: "171.3 Hz", value: "171.3" },
    { label: "173.8 Hz", value: "173.8" },
    { label: "177.3 Hz", value: "177.3" },
    { label: "179.9 Hz", value: "179.9" },
    { label: "183.5 Hz", value: "183.5" },
    { label: "186.2 Hz", value: "186.2" },
    { label: "189.9 Hz", value: "189.9" },
    { label: "192.8 Hz", value: "192.8" },
    { label: "196.6 Hz", value: "196.6" },
    { label: "199.5 Hz", value: "199.5" },
    { label: "203.5 Hz", value: "203.5" },
    { label: "206.5 Hz", value: "206.5" },
    { label: "210.7 Hz", value: "210.7" },
    { label: "218.1 Hz", value: "218.1" },
    { label: "225.7 Hz", value: "225.7" },
    { label: "229.1 Hz", value: "229.1" },
    { label: "233.6 Hz", value: "233.6" },
    { label: "241.8 Hz", value: "241.8" },
    { label: "250.3 Hz", value: "250.3" },
    { label: "254.1 Hz", value: "254.1" },
];

const bandDetails = (band) => {
    return bands.find(elem => elem.value === band);
}

const frequencyDetails = (frequency) => {
    return bandFrequencies.find(elem => elem.value === frequency);
}

const toneDetails = (tone) => {
    return CTCSSFrequencies.find(elem => elem.value === tone);
}

const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase().replace(/\s/g, "");
    s2 = s2.toLowerCase().replace(/\s/g, "");
    var costs = [];
    for (let i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
  
const similarity = (s1, s2) => {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    let longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

const randomOffsetWithin = (radius, from) => {

    const [ latd, long ] = from;

    // Earth’s radius, sphere
    const R = 6378137;

    // Offsets in meters
    const dn = Math.floor(Math.random() * radius);
    const de = Math.floor(Math.random() * radius);

    // Coordinate offsets in radians
    const dLatd = dn/R;
    const dLong = de/(R * Math.cos(Math.PI * latd/180));

    // OffsetPosition, decimal degrees
    const latdO = latd + dLatd * 180/Math.PI;
    const longO = long + dLong * 180/Math.PI;

    return [latdO, longO];
}

function distance(latd1, long1, latd2, long2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(latd2-latd1);  // deg2rad below
    var dLon = deg2rad(long2-long1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(latd1)) * Math.cos(deg2rad(latd2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

function bearing(latd1, long1, latd2, long2) {
    latd1 = deg2rad(latd1);
    long1 = deg2rad(long1);
    latd2 = deg2rad(latd2);
    long2 = deg2rad(long2);

    const y = Math.sin(long2 - long1) * Math.cos(latd2);
    const x = Math.cos(latd1) * Math.sin(latd2) - Math.sin(latd1) * Math.cos(latd2) * Math.cos(long2 - long1);
    let brng = Math.atan2(y, x);
    brng = rad2deg(brng);

    return (brng + 360) % 360;
}
  
function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function rad2deg(radians) {
    return radians * 180 / Math.PI;
}  

const geoapifyURL = (latitude, longitude) => {
    const apiKey = 'ec1d0d714dcf40b1b885779c7599b467';
    const apiURL = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&type=street&apiKey=${apiKey}`;
    return apiURL;
}

const QRXLookupConfig = {
    appVersion,
    locales,
    OpenStreetMapTileLayer,
    criticalAirTime,
    extraAirTime,
    lessAirTime,
    ghostAirTime,
    maxRadios,
    similarityPct,
    bands,
    bandDetails,
    bandFrequencies,
    frequencyDetails,
    CTCSSFrequencies,
    editDistance,
    similarity,
    toneDetails,
    randomOffsetWithin,
    distance,
    bearing,
    deg2rad,
    rad2deg,
    geoapifyURL,
};

export default QRXLookupConfig;