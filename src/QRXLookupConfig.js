const credit = {
    attrib: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    attribURL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

const extraAirTime = 30;

const bands = [
    { label: "PMR | FM", value: "pmr.70cm-fm", range: {urban: 1, rural: 3} },
    { label: "CB | USB", value: "cb.11m-usb", range: {urban: 20, rural: 50} },
    { label: "CB | LSB", value: "cb.11m-lsb", range: {urban: 20, rural: 50} },
    { label: "CB | AM", value: "cb.11m-am", range: {urban: 5, rural: 10} },
    { label: "CB | FM", value: "cb.11m-fm", range: {urban: 5, rural: 10} },
    { label: "LPD | FM", value: "lpd.70cm-fm", range: {urban: 0.5, rural: 1} }
];

const bandFrequencies = [
    { label: "CH-01 | 433.075 MHz", value: "433.075", link: "lpd.70cm-fm" },
    { label: "CH-02 | 433.100 MHz", value: "433.100", link: "lpd.70cm-fm" },
    { label: "CH-03 | 433.125 MHz", value: "433.125", link: "lpd.70cm-fm" },
    { label: "CH-04 | 433.150 MHz", value: "433.150", link: "lpd.70cm-fm" },
    { label: "CH-05 | 433.175 MHz", value: "433.175", link: "lpd.70cm-fm" },
    { label: "CH-06 | 433.200 MHz", value: "433.200", link: "lpd.70cm-fm" },
    { label: "CH-07 | 433.225 MHz", value: "433.225", link: "lpd.70cm-fm" },
    { label: "CH-08 | 433.250 MHz", value: "433.250", link: "lpd.70cm-fm" },
    { label: "CH-09 | 433.275 MHz", value: "433.275", link: "lpd.70cm-fm" },
    { label: "CH-10 | 433.300 MHz", value: "433.300", link: "lpd.70cm-fm" },
    { label: "CH-11 | 433.325 MHz", value: "433.325", link: "lpd.70cm-fm" },
    { label: "CH-12 | 433.350 MHz", value: "433.350", link: "lpd.70cm-fm" },
    { label: "CH-13 | 433.375 MHz", value: "433.375", link: "lpd.70cm-fm" },
    { label: "CH-14 | 433.400 MHz", value: "433.400", link: "lpd.70cm-fm" },
    { label: "CH-15 | 433.425 MHz", value: "433.425", link: "lpd.70cm-fm" },
    { label: "CH-16 | 433.450 MHz", value: "433.450", link: "lpd.70cm-fm" },
    { label: "CH-17 | 433.475 MHz", value: "433.475", link: "lpd.70cm-fm" },
    { label: "CH-18 | 433.500 MHz", value: "433.500", link: "lpd.70cm-fm" },
    { label: "CH-19 | 433.525 MHz", value: "433.525", link: "lpd.70cm-fm" },
    { label: "CH-20 | 433.550 MHz", value: "433.550", link: "lpd.70cm-fm" },
    { label: "CH-21 | 433.575 MHz", value: "433.575", link: "lpd.70cm-fm" },
    { label: "CH-22 | 433.600 MHz", value: "433.600", link: "lpd.70cm-fm" },
    { label: "CH-23 | 433.625 MHz", value: "433.625", link: "lpd.70cm-fm" },
    { label: "CH-24 | 433.650 MHz", value: "433.650", link: "lpd.70cm-fm" },
    { label: "CH-25 | 433.675 MHz", value: "433.675", link: "lpd.70cm-fm" },
    { label: "CH-26 | 433.700 MHz", value: "433.700", link: "lpd.70cm-fm" },
    { label: "CH-27 | 433.725 MHz", value: "433.725", link: "lpd.70cm-fm" },
    { label: "CH-28 | 433.750 MHz", value: "433.750", link: "lpd.70cm-fm" },
    { label: "CH-29 | 433.775 MHz", value: "433.775", link: "lpd.70cm-fm" },
    { label: "CH-30 | 433.800 MHz", value: "433.800", link: "lpd.70cm-fm" },
    { label: "CH-31 | 433.825 MHz", value: "433.825", link: "lpd.70cm-fm" },
    { label: "CH-32 | 433.850 MHz", value: "433.850", link: "lpd.70cm-fm" },
    { label: "CH-33 | 433.875 MHz", value: "433.875", link: "lpd.70cm-fm" },
    { label: "CH-34 | 433.900 MHz", value: "433.900", link: "lpd.70cm-fm" },
    { label: "CH-35 | 433.925 MHz", value: "433.925", link: "lpd.70cm-fm" },
    { label: "CH-36 | 433.950 MHz", value: "433.950", link: "lpd.70cm-fm" },
    { label: "CH-37 | 433.975 MHz", value: "433.975", link: "lpd.70cm-fm" },
    { label: "CH-38 | 434.000 MHz", value: "434.000", link: "lpd.70cm-fm" },
    { label: "CH-39 | 434.025 MHz", value: "434.025", link: "lpd.70cm-fm" },
    { label: "CH-40 | 434.050 MHz", value: "434.050", link: "lpd.70cm-fm" },
    { label: "CH-41 | 434.075 MHz", value: "434.075", link: "lpd.70cm-fm" },
    { label: "CH-42 | 434.100 MHz", value: "434.100", link: "lpd.70cm-fm" },
    { label: "CH-43 | 434.125 MHz", value: "434.125", link: "lpd.70cm-fm" },
    { label: "CH-44 | 434.150 MHz", value: "434.150", link: "lpd.70cm-fm" },
    { label: "CH-45 | 434.175 MHz", value: "434.175", link: "lpd.70cm-fm" },
    { label: "CH-46 | 434.200 MHz", value: "434.200", link: "lpd.70cm-fm" },
    { label: "CH-47 | 434.225 MHz", value: "434.225", link: "lpd.70cm-fm" },
    { label: "CH-48 | 434.250 MHz", value: "434.250", link: "lpd.70cm-fm" },
    { label: "CH-49 | 434.275 MHz", value: "434.275", link: "lpd.70cm-fm" },
    { label: "CH-50 | 434.300 MHz", value: "434.300", link: "lpd.70cm-fm" },
    { label: "CH-51 | 434.325 MHz", value: "434.325", link: "lpd.70cm-fm" },
    { label: "CH-52 | 434.350 MHz", value: "434.350", link: "lpd.70cm-fm" },
    { label: "CH-53 | 434.375 MHz", value: "434.375", link: "lpd.70cm-fm" },
    { label: "CH-54 | 434.400 MHz", value: "434.400", link: "lpd.70cm-fm" },
    { label: "CH-55 | 434.425 MHz", value: "434.425", link: "lpd.70cm-fm" },
    { label: "CH-56 | 434.450 MHz", value: "434.450", link: "lpd.70cm-fm" },
    { label: "CH-57 | 434.475 MHz", value: "434.475", link: "lpd.70cm-fm" },
    { label: "CH-58 | 434.500 MHz", value: "434.500", link: "lpd.70cm-fm" },
    { label: "CH-59 | 434.525 MHz", value: "434.525", link: "lpd.70cm-fm" },
    { label: "CH-60 | 434.550 MHz", value: "434.550", link: "lpd.70cm-fm" },
    { label: "CH-61 | 434.575 MHz", value: "434.575", link: "lpd.70cm-fm" },
    { label: "CH-62 | 434.600 MHz", value: "434.600", link: "lpd.70cm-fm" },
    { label: "CH-63 | 434.625 MHz", value: "434.625", link: "lpd.70cm-fm" },
    { label: "CH-64 | 434.650 MHz", value: "434.650", link: "lpd.70cm-fm" },
    { label: "CH-65 | 434.675 MHz", value: "434.675", link: "lpd.70cm-fm" },
    { label: "CH-66 | 434.700 MHz", value: "434.700", link: "lpd.70cm-fm" },
    { label: "CH-67 | 434.725 MHz", value: "434.725", link: "lpd.70cm-fm" },
    { label: "CH-68 | 434.750 MHz", value: "434.750", link: "lpd.70cm-fm" },
    { label: "CH-69 | 434.775 MHz", value: "434.775", link: "lpd.70cm-fm" },
    
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

const geoapifyURL = (latitude, longitude) => {
    const apiKey = 'ec1d0d714dcf40b1b885779c7599b467';
    const apiURL = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`;
    return apiURL;
}

const QRXLookupConfig = {
    credit,
    extraAirTime,
    bands,
    bandFrequencies,
    CTCSSFrequencies,
    geoapifyURL,
};

export default QRXLookupConfig;