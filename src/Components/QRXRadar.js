import QRXLookupConfig from '../QRXLookupConfig';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

const styles = {
    height: '35rem', 
    // width: '75%',
    border: '0.1rem solid rgba(60, 64, 67, 0.3)',
    borderRadius: '0.3rem',
};

function QRXRadar({contactSession}) {

    const attrib = QRXLookupConfig.credit.attrib;
    const attribURL = QRXLookupConfig.credit.attribURL  ;

    const zoom = 13;

    const centerPopup = contactSession.callsign + ' at ' + contactSession.maidenhead;
    const centerCoords = [
        contactSession.latitude,
        contactSession.longitude
    ];

    let expired = contactSession.checkOut? (new Date()).getTime() > contactSession.checkOut.getTime(): false;

    function ChangeView({ center, zoom }) {
        const map = useMap();
        map.setView(center, zoom);
        return null;
    }

    return (    
        <MapContainer center={centerCoords} zoom={zoom} scrollWheelZoom={false} style={styles}>
            <ChangeView center={centerCoords} zoom={zoom} /> 
            <TileLayer attribution={attrib} url={attribURL}/>
            {centerCoords[0] !== 0 && centerCoords[1] !== 0 && !expired? (
                <Marker position={centerCoords}>
                    <Popup>{centerPopup}</Popup>
                </Marker>
            ) : (
                null
            )}
        </MapContainer>
    );
}

export default QRXRadar;