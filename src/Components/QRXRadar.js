import QRXLookupConfig from '../QRXLookupConfig';

import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconNormal from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';

let DefaultIcon = Leaflet.icon({
    ...Leaflet.Icon.Default.prototype.options,
    iconUrl: iconNormal,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow
});

Leaflet.Marker.prototype.options.icon = DefaultIcon;

const styles = {
    height: '35rem', 
    border: '0.1rem solid rgba(60, 64, 67, 0.3)',
    borderRadius: '0.3rem',
};

function QRXRadar({centerContactSession, bandPerimeter, activeContactSessions}) {

    const attrib = QRXLookupConfig.credit.attrib;
    const attribURL = QRXLookupConfig.credit.attribURL  ;
    const bands = QRXLookupConfig.bands;
    const bandFrequencies = QRXLookupConfig.bandFrequencies;
    const CTCSSFrequencies = QRXLookupConfig.CTCSSFrequencies;
  
    const zoom = 13;

    function ChangeView({ center, zoom }) {
        const map = useMap();
        map.setView(center, zoom);
        return null;
    }
    
    return (    
        <MapContainer center={centerContactSession} zoom={zoom} scrollWheelZoom={false} style={styles}>
            <ChangeView center={centerContactSession} zoom={zoom} />
            <TileLayer attribution={attrib} url={attribURL}/>
            {bandPerimeter? <Circle center={centerContactSession} pathOptions={{fill: false, color: 'red', weight: 1}} radius={bandPerimeter * 1000} />:null}
            {activeContactSessions.map(({ 
                latitude, longitude, callsign, operator, maidenhead, band, frequency, CTCSSFrequency
            }, idx) => { 

                const bandLabel = band? bands.find(elem => elem.value === band).label: null;
                const freqLabel = frequency? bandFrequencies.find(elem => elem.value === frequency).label: null;
                const toneLabel = CTCSSFrequency? CTCSSFrequencies.find(elem => elem.value === CTCSSFrequency).label: null;
                                
                return (
                    <Marker position={ [latitude, longitude] } key={idx}>
                        <Popup>
                            <center>
                            <b>{ callsign + ' @ ' + maidenhead }</b><br/>
                            {operator? <><i>({ operator })</i><br/></>: null}
                            <p><code>{ bandLabel + ' | ' + freqLabel }{ toneLabel? ' | Tone ' + toneLabel: '' }</code></p>
                            </center>
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    );
}

export default QRXRadar;