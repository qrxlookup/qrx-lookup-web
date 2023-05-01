
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from '../App';

import QRXLookupConfig from '../QRXLookupConfig';

import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconNormal from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';

let defaultIcon = Leaflet.icon({
    ...Leaflet.Icon.Default.prototype.options,
    iconUrl: iconNormal,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow
});

Leaflet.Marker.prototype.options.icon = defaultIcon;

const styles = {
    aspectRatio: 1,
    border: '0.1rem solid rgba(60, 64, 67, 0.3)',
    borderRadius: '0.3rem',
};

function QRXRadar({ contact, reports, center = null, activeContactSessions }) {

    const { t } = useTranslation();

    const { language } = useContext(AppContext)

    const redMarker = '/img/vecteezy-map-pin-red.png';
    const multiColorMarker = '/img/vecteezy-map-pin-multicolor.png';

    // const url = QRXLookupConfig.OpenStreetMapTileLayer.stamen.url;
    // const attrib = QRXLookupConfig.OpenStreetMapTileLayer.stamen.attrib;
    const url = QRXLookupConfig.OpenStreetMapTileLayer.default.url;
    const attrib = QRXLookupConfig.OpenStreetMapTileLayer.default.attrib;

    const contactCallsigns = contact?.callsigns || [];
    const sessionsLength = contact?.sessions?.length? contact?.sessions?.length: 0;
    const lastSession = sessionsLength > 0? contact?.sessions[sessionsLength - 1]: null;

    const radarCenter = [ 
        center? center[0]: lastSession?.latitude, 
        center? center[1]: lastSession?.longitude,
    ];

    const perimeterCenter = [
        lastSession?.latitude, 
        lastSession?.longitude,
    ];

    const zoom = 11;
    
    let radarPerimeter = null;
    if (contact?.perimeter && lastSession?.radios) {
        const bandDetails = QRXLookupConfig.bandDetails(lastSession?.radios[0]?.band);
        radarPerimeter = bandDetails? bandDetails?.range[contact?.perimeter] * 1000: '';
    }

    function ChangeView({ center, zoom }) {
        const map = useMap();
        map.setView(center, zoom);
        return null;
    }

    // console.log('about to render QRXRadar...');
    // console.log('\n');

    return (

        <MapContainer center={radarCenter} zoom={zoom} maxZoom={14} scrollWheelZoom={false} style={styles}>
        <ChangeView center={radarCenter} zoom={zoom} />
        <TileLayer url={url} attribution={attrib} />

        {radarPerimeter && lastSession.radios.length === 1?
            <Circle center={perimeterCenter} radius={radarPerimeter} 
                pathOptions={{fill: false, color: 'red', weight: 1}} />
            :null
        }

        {activeContactSessions.map(({ 
            sessionId, checkOut, ghostCheckOut, 
            maidenhead, distance, bearing, latitude, longitude, 
            operator, radios
        }) => {

            const multiRadio = (radios && radios.length > 1);

            let ghostSession = false;
            if (checkOut < new Date() && ghostCheckOut > new Date()) {
                ghostSession = true;
            }
            
            let pinIcon = {
                ...Leaflet.Icon.Default.prototype.options,
                iconUrl: multiRadio? multiColorMarker: radios[0].bandPinIcon,
                iconRetinaUrl: multiRadio? multiColorMarker: radios[0].bandPinIcon,
                iconSize: [20, 30],
                iconAnchor: [10, 24],
                shadowSize: [0, 0],
            };

            if (contactCallsigns?.includes(radios[0].callsign)) {
                pinIcon.iconUrl = redMarker;
                pinIcon.iconRetinaUrl = redMarker;
            }

            let markerIcon = Leaflet.icon(pinIcon);

            let radiosMarkups = []; let k = 0;
            radios.forEach((r) => {
                let [ channel ] = r.frequency.replace(/\s/g, "").split("|");
                radiosMarkups.push(
                    <p style={{fontFamily: 'monospace', color: r.bandFontColor }} key={`${sessionId}-${k}`}>
                        <b>{ `${r.callsign}`}</b> {`${r.band} | ${channel}`}{ r.tone? ` | ${r.tone}`: '' } 
                    </p>
                ); k = k + 1;
            });

            return (
                <Marker position={ [latitude, longitude] } icon={markerIcon} opacity={ghostSession? 0.3: 1.0} key={sessionId}>
                    <Popup>
                        <center>
                            {operator? <i>{ operator }</i>: null}
                            <br/>
                            {radiosMarkups}
                            <b style={{fontFamily: 'monospace'}}>
                                {`${distance}km / ${bearing}° / ${maidenhead}`}
                            </b>
                            <p style={{color: 'red'}}>
                                {`${t('upTo')} ${checkOut.toLocaleString(QRXLookupConfig.locales[language])}`}
                            </p>
                        </center>
                    </Popup>
                </Marker>
            );
        })}
            
        </MapContainer>
    );
}

export default QRXRadar;