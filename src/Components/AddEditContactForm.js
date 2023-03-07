import { useState, useContext } from 'react';
import QRXLookupConfig from '../QRXLookupConfig';
import QRXMaidenhead from '../QRXMaidenhead';
import { ContactContext } from '../App';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";

import { ContactSessionInitialState } from '../App';

function AddEditContactForm() {

    const { contact, setContact } = useContext(ContactContext);

    let contactSessionInitialState = null;
    if (contact.sessions.length > 0) { 
        contactSessionInitialState = { ...contact.sessions[contact.sessions.length - 1] };
    } else {
        contactSessionInitialState = { ...ContactSessionInitialState };
    }
    const [ contactSession, setContactSession ] = useState(contactSessionInitialState);

    const [filteredBandFrequencies, setFilteredBandFrequencies] = useState([]);

    const [formCall, setFormCall] = useState(contactSession.callsign);
    const [formBand, setFormBand] = useState(contactSession.band);
    const [formFreq, setFormFreq] = useState(contactSession.frequency);
    const [formCTCSSFreq, setFormCTCSSFreq] = useState(contactSession.CTCSSFrequency);
    const [formLatd, setFormLatd] = useState(contactSession.latitude);
    const [formLong, setFormLong] = useState(contactSession.longitude);
    
    const bands = QRXLookupConfig.bands;
    const bandFrequencies = QRXLookupConfig.bandFrequencies;
    const CTCSSFrequencies = QRXLookupConfig.CTCSSFrequencies;

    function getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(savePosition, showError);
        }
    }

    function savePosition(position) {
        setFormLatd(position.coords.latitude);
        setFormLong(position.coords.longitude);
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;

            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;

            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;

            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                break;

            default:
                //"Some other situation."
                break;
        }
    }
    
    function handleMoreAirTime(e) {
        e.preventDefault();

        let sessions = [ ...contact.sessions ];

        let updatedContactSession = {
            callsign: formCall,
            band: formBand,
            frequency: formFreq,
            CTCSSFrequency: formCTCSSFreq,
            latitude: parseFloat(formLatd),
            longitude: parseFloat(formLong),
            maidenhead: QRXMaidenhead.gridForLatLon(parseFloat(formLatd), parseFloat(formLong)),
            checkIn: contactSession.checkIn? new Date(contactSession.checkIn): new Date(),
            checkOut: contactSession.checkOut? new Date(contactSession.checkOut): new Date(),
        };

        updatedContactSession.checkOut.setMinutes(
            updatedContactSession.checkOut.getMinutes() + QRXLookupConfig.checkInTimeoutMinutes
        );

        if (
            contact.sessions.length < 1
            || (new Date()).getTime() > contactSession.checkOut.getTime()
            || updatedContactSession.callsign !== contactSession.callsign
        ) {
            console.log('First | New session...');

            updatedContactSession.checkIn = new Date();

            if (contact.sessions.length > 0) {
                updatedContactSession.checkOut = new Date();
                updatedContactSession.checkOut.setMinutes(
                    updatedContactSession.checkOut.getMinutes() + QRXLookupConfig.checkInTimeoutMinutes
                );
            }

            sessions = [ ...sessions, {...updatedContactSession} ];
            
        } else {
            console.log('Current session...');

            const currElem = contact.sessions.length > 0? contact.sessions.length - 1: 0;

            sessions[currElem] = { ...updatedContactSession };
        }

        setContact({
            ...contact,
            sessions: sessions,
        });

        setContactSession({
            ...updatedContactSession,
        });
    };

    function handleVoidAirTime(e) {
        e.preventDefault();

        const currElem = contact.sessions.length > 0? contact.sessions.length - 1: 0;

        let sessions = [ ...contact.sessions ];

        let updatedContactSession = { ...contactSession };

        updatedContactSession.checkOut = new Date();

        sessions[currElem] = { ...updatedContactSession };

        setContact({
            ...contact,
            sessions: sessions,
        });

        setContactSession({
            ...updatedContactSession,
        });
    };

    function handleBandChange(band) {

        if (band.startsWith('cb.11m')) {
            setFilteredBandFrequencies(bandFrequencies.filter(
                (o) => o.link.startsWith('cb.11m')
            ));
        } else {
            setFilteredBandFrequencies(bandFrequencies.filter(
                (o) => o.link === band
            ));
        }

        setFormBand(band);
        setFormFreq('');
    };

    getCurrentLocation();

    return (
        <Form onSubmit={(e) => handleMoreAirTime(e)}>
            <Form.Group className="mb-2" controlId="callsign">
                <Form.Label>Callsign</Form.Label>
                <Form.Control value={formCall} required onChange={(e) => setFormCall(e.target.value)} type="text" placeholder="Your callsign" />
            </Form.Group>
            <Form.Group className="mb-2" controlId="band">
                <Form.Label>Band | Modulation</Form.Label>
                <Form.Select value={formBand} required onChange={(e) => handleBandChange(e.target.value)}>
                    <option />
                    {bands.map((item, index) => {
                        return (
                            <option key={index} value={item.value}>{item.label}</option>
                        )
                    })}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2" controlId="frequency">
                <Form.Label>Channel | Frequency</Form.Label>
                <Form.Select value={formFreq} required onChange={(e) => setFormFreq(e.target.value)}>
                    <option />
                    {filteredBandFrequencies.map((item, index) => {
                        return (
                            <option key={index} value={item.value}>{item.label}</option>
                        )
                    })}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2" controlId="CTCSSFrequency">
                <Form.Label>CTCSS Frequency</Form.Label>
                <Form.Select value={formCTCSSFreq} onChange={(e) => setFormCTCSSFreq(e.target.value)}>
                    <option />
                    {CTCSSFrequencies.map((item, index) => {
                        return (
                            <option key={index} value={item.value}>{item.label}</option>
                        )
                    })}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2" controlId="latitude">
                <Form.Label>Latitude</Form.Label>
                <Form.Control value={formLatd} required readOnly onChange={(e) => setFormLatd(e.target.value)} type="text" />
            </Form.Group>
            <Form.Group className="mb-2" controlId="longitude">
                <Form.Label>Longitude</Form.Label>
                <Form.Control value={formLong} required readOnly onChange={(e) => setFormLong(e.target.value)} type="text" />
            </Form.Group>
            <Button variant="primary" type="button" onClick={getCurrentLocation} style={{ marginLeft: '.5rem' }}>
                <FontAwesomeIcon icon={faLocationCrosshairs} size="1x" />
            </Button>
            <Button variant="danger" type="button" disabled={contact.sessions.length < 0} onClick={(e) => handleVoidAirTime(e)} style={{ marginLeft: '.5rem' }}>
                0m
            </Button>
            <Button variant="primary" type="submit" style={{ marginLeft: '.5rem' }}>
                +{QRXLookupConfig.checkInTimeoutMinutes}m
            </Button>
        </Form>
    );
}

export default AddEditContactForm;