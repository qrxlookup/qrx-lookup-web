import QRXLookupConfig from '../QRXLookupConfig';

import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconNormal from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
// import "leaflet/dist/images/layers-2x.png";
// import "leaflet/dist/images/layers.png";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

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

function QRXRadar({centerContactSession, activeContactSessions}) {

    const attrib = QRXLookupConfig.credit.attrib;
    const attribURL = QRXLookupConfig.credit.attribURL  ;

    const zoom = 13;

    // const centerPopup = contactSession.callsign + ' at ' + contactSession.maidenhead;
    // const centerCoords = [
    //     contactSession.latitude,
    //     contactSession.longitude
    // ];

    // let expired = contactSession.checkOut? (new Date()).getTime() > contactSession.checkOut.getTime(): false;

    function ChangeView({ center, zoom }) {
        const map = useMap();
        map.setView(center, zoom);
        return null;
    }
    
    return (    
        <MapContainer center={centerContactSession} zoom={zoom} scrollWheelZoom={false} style={styles}>
            <ChangeView center={centerContactSession} zoom={zoom} />
            <TileLayer attribution={attrib} url={attribURL}/>
            {activeContactSessions.map(({ latitude, longitude, callsign, maidenhead }, idx) => {                 
                return (
                    <Marker position={ [latitude, longitude] } key={idx}>
                        <Popup>{ callsign + ' @ ' + maidenhead }</Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    );
}

export default QRXRadar;