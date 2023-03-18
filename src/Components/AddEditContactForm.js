import { useState, useContext, useEffect } from 'react';
import QRXLookupConfig from '../QRXLookupConfig';
import QRXMaidenhead from '../QRXMaidenhead';
import { ContactContext } from '../App';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";

import { ContactSessionInitialState } from '../App';

function AddEditContactForm({ handleUpdateContact }) {

    const { contact, setContact, setAddEditContactFormHide } = useContext(ContactContext);

    const sessionsLength = contact?.sessions?.length? contact.sessions.length: 0;
    const contactSession  = sessionsLength > 0?
        { ...contact.sessions[sessionsLength - 1] }:
        { ...ContactSessionInitialState };

    const bands = QRXLookupConfig.bands;
    const bandFrequencies = QRXLookupConfig.bandFrequencies;
    const CTCSSFrequencies = QRXLookupConfig.CTCSSFrequencies;

    const [form, setForm] = useState({
        id: contactSession.sessionId,
        call: contactSession.callsign,
        band: contactSession.band,
        freq: contactSession.frequency,
        tone: contactSession.CTCSSFrequency,
        latd: contactSession.latitude,
        long: contactSession.longitude,
        freqOpt: [ ...filterFreqOpt(contactSession.band) ],
        getPos: false,
    });

    function filterFreqOpt(band) {
        let filtered = [];
        if (band && band.startsWith('cb.11m')) {
            filtered = bandFrequencies.filter(
                (o) => o.link.startsWith('cb.11m')
            );
        } else if (band) {
            filtered = bandFrequencies.filter(
                (o) => o.link === band
            );
        }
        return filtered;
    }

    function handleGetCurrentLocation() {
        setForm({
            ...form,
            getPos: true,
        });
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(savePosition, showError);
        }
    }

    function savePosition(position) {
        setForm({
            ...form,
            latd: Math.fround(position.coords.latitude),
            long: Math.fround(position.coords.longitude),
            getPos: false,
        });
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

        let contactSessions = [ ...contact.sessions ];

        let updatedContactSession = {
            sessionId: form.id,
            callsign: form.call,
            band: form.band,
            frequency: form.freq,
            CTCSSFrequency: form.tone,
            latitude: Math.fround(form.latd),
            longitude: Math.fround(form.long),
            maidenhead: QRXMaidenhead.gridForLatLon(form.latd, form.long),
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

            updatedContactSession.sessionId = crypto.randomUUID();
            updatedContactSession.checkIn = new Date();

            if (contact.sessions.length > 0) {
                updatedContactSession.checkOut = new Date();
                updatedContactSession.checkOut.setMinutes(
                    updatedContactSession.checkOut.getMinutes() + QRXLookupConfig.checkInTimeoutMinutes
                );
            }

            contactSessions = [ ...contactSessions, {...updatedContactSession} ];
            
        } else {
            console.log('Current session...');

            const currElem = contact.sessions.length > 0? contact.sessions.length - 1: 0;

            contactSessions[currElem] = { ...updatedContactSession };
        }

        let updatedContact = {
            ...contact,
            sessions: [ ...contactSessions ],
        };

        handleUpdateContact(updatedContact);

        // setContactSession({
        //     ...updatedContactSession,
        // });

        setAddEditContactFormHide(true);
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

        // setContactSession({
        //     ...updatedContactSession,
        // });
    };

    function handleBandChange(band) {
        setForm({
            ...form,
            band: band,
            freq: '',
            freqOpt: [ ...filterFreqOpt(band) ],
        });        
    };
    
    useEffect(() => {
        setForm({
            ...form,
            id: contactSession.sessionId,
            call: contactSession.callsign,
            band: contactSession.band,
            freq: contactSession.frequency,
            tone: contactSession.CTCSSFrequency,
            latd: contactSession.latitude,
            long: contactSession.longitude,
            freqOpt: [ ...filterFreqOpt(contactSession.band) ],
        });
    // eslint-disable-next-line
    }, [contact]);

    // console.log('about to render AddEditContactForm...');

    return (
        <Form onSubmit={(e) => handleMoreAirTime(e)}>
            <Form.Group className="mb-2" controlId="callsign">
                <Form.Label>Callsign</Form.Label>
                <Form.Control value={form.call} required onChange={(e) => setForm({ ...form, call: e.target.value })} type="text" placeholder="Your callsign" />
            </Form.Group>
            <Form.Group className="mb-2" controlId="band">
                <Form.Label>Band | Modulation</Form.Label>
                <Form.Select value={form.band} required onChange={(e) => handleBandChange(e.target.value)}>
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
                <Form.Select value={form.freq} required onChange={(e) => setForm({ ...form, freq: e.target.value })}>
                    <option />
                    {form.freqOpt.map((item, index) => {
                        return (
                            <option key={index} value={item.value}>{item.label}</option>
                        )
                    })}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2" controlId="CTCSSFrequency">
                <Form.Label>CTCSS Frequency</Form.Label>
                <Form.Select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
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
                <Form.Control value={form.latd} required onChange={(e) => setForm({ ...form, latd: e.target.value })} type="text" />
            </Form.Group>
            <Form.Group className="mb-2" controlId="longitude">
                <Form.Label>Longitude</Form.Label>
                <Form.Control value={form.long} required onChange={(e) => setForm({ ...form, long: e.target.value })} type="text" />
            </Form.Group>
            <Button variant="primary" type="button" disabled={form.getPos} onClick={() => handleGetCurrentLocation()} style={{ marginLeft: '.3rem', marginBottom: '.5rem' }}>
                <FontAwesomeIcon icon={faLocationCrosshairs} size="1x" />
            </Button>
            <Button variant="danger" type="button" onClick={(e) => handleVoidAirTime(e)} style={{ marginLeft: '.3rem', marginBottom: '.5rem' }}>
                0m
            </Button>
            <Button variant="primary" type="submit" style={{ marginLeft: '.3rem', marginBottom: '.5rem' }}>
                +{QRXLookupConfig.checkInTimeoutMinutes}m
            </Button>
        </Form>
    );
}

export default AddEditContactForm;