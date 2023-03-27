import { useTranslation } from "react-i18next";

import QRXLookupConfig from '../QRXLookupConfig';

import Table from 'react-bootstrap/Table';

function distance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

function bearing(startLat, startLng, destLat, destLng) {
    startLat = deg2rad(startLat);
    startLng = deg2rad(startLng);
    destLat = deg2rad(destLat);
    destLng = deg2rad(destLng);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
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

function QRXTable({ center, activeAndZombieSessions }) {

    const { t } = useTranslation();

    const bands = QRXLookupConfig.bands;
    const bandFrequencies = QRXLookupConfig.bandFrequencies;
    const CTCSSFrequencies = QRXLookupConfig.CTCSSFrequencies;  
  
    return (
        <Table responsive striped bordered hover>
            <thead>
                <tr>
                    <th>{t('contactForm.CallSign')}</th>
                    <th>{t('contactForm.BandAndModulation')}</th>
                    <th>{t('contactForm.ChannelAndFrequency')}</th>
                    <th>{t('contactForm.CTCSSFrequency')}</th>
                    <th>{t('contactForm.Maidenhead')}</th>
                    <th>{t('contactForm.Distance')}</th>
                    <th>{t('contactForm.Bearing')}</th>
                    <th>{t('contactForm.Locality')}</th>
                    <th>{t('contactForm.City')}</th>
                    <th>{t('contactForm.Country')}</th>
                </tr>
            </thead>
            <tbody>
                {activeAndZombieSessions.map((item, idx) => {

                    const band = bands.find(elem => elem.value === item.band);
                    const freq = bandFrequencies.find(elem => elem.value === item.frequency);
                    const tone = CTCSSFrequencies.find(elem => elem.value === item.CTCSSFrequency);

                    const dist = distance(
                        center[0],
                        center[1],
                        item.latitude,
                        item.longitude,
                    ).toFixed(2);

                    const bear = bearing(
                        center[0],
                        center[1],
                        item.latitude,
                        item.longitude,
                    ).toFixed(0);

                    return (
                        <tr key={item.sessionId}>
                            <th>{item.callsign}</th>
                            <th>{band?.label? band.label: ''}</th>
                            <th>{freq?.label? freq.label: ''}</th>
                            <th>{tone?.label? tone.label: ''}</th>
                            <th>{item.maidenhead}</th>
                            <th>{dist}km</th>
                            <th>{bear}°</th>
                            <th>{item.locality}</th>
                            <th>{item.city}</th>
                            <th>{item.country}</th>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
}

export default QRXTable;