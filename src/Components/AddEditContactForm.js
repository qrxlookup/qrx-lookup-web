import { useTranslation } from "react-i18next";

import { useState, useEffect } from 'react';
import QRXLookupConfig from '../QRXLookupConfig';
import QRXMaidenhead from '../QRXMaidenhead';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";

import { ContactSessionInitialState } from '../App';

// eslint-disable-next-line
const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
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

// eslint-disable-next-line
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

// eslint-disable-next-line
const reverseGeocoding = async (latitude, longitude) => {

    const apiURL = QRXLookupConfig.geoapifyURL(latitude, longitude)

    const response = await fetch(apiURL);

    // TODO: Check status of fetch...
    // {response.status_code}

    const data = await response.json();

    return data.features[0].properties;
}

function AddEditContactForm({ contact, handleUpdateContact, setAddEditContactFormHide }) {

    const { t } = useTranslation();

    let contactSessions = [ ...contact.sessions ];
    const contactSessionsLength = contactSessions?.length? contactSessions.length: 0;
    const contactLastSession  = contactSessionsLength > 0?
        { ...contactSessions[contactSessionsLength - 1] }:
        { ...ContactSessionInitialState };

    const bands = QRXLookupConfig.bands;
    const bandFrequencies = QRXLookupConfig.bandFrequencies;
    const CTCSSFrequencies = QRXLookupConfig.CTCSSFrequencies;

    const [form, setForm] = useState({
        airTime: contactLastSession.checkOut < new Date()? '30': null,
        id: contactLastSession.sessionId,
        oper: contact.operator,
        call: contactLastSession.callsign,
        band: contactLastSession.band,
        freq: contactLastSession.frequency,
        tone: contactLastSession.CTCSSFrequency,
        latd: contactLastSession.latitude,
        long: contactLastSession.longitude,
        perimeter: 'none',
        freqOpt: [ ...filterFreqOpt(contactLastSession.band) ],
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
            navigator.geolocation.getCurrentPosition(handleUpdatePosition, handleCurrentLocationError);
        }
    }

    function handleUpdatePosition(position) {
        setForm({
            ...form,
            latd: Math.fround(position.coords.latitude),
            long: Math.fround(position.coords.longitude),
            getPos: false,
        });
    }

    function handleCurrentLocationError(error) {
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

    function adjustAirTime(adjustement, endTime) {

        let adjusted = new Date(endTime);

        if (parseInt(adjustement) === 0) {

            if (endTime > new Date()) adjusted = new Date();

        } else if (Number.isInteger(parseInt(adjustement))) {

            adjusted.setMinutes(
                adjusted.getMinutes() + parseInt(adjustement)
            );

            if (adjusted < new Date()) {
                adjusted = new Date(endTime);
            }
        }

        return adjusted;
    }
    
    async function handleUpdateSession(e) {
        e.preventDefault();

        const lastSessionIdx = contactSessionsLength > 0? contactSessionsLength - 1: 0;

        const latd = Math.fround(form.latd);
        const long= Math.fround(form.long);

        let contactUpdatedSession = {
            sessionId: form.id,
            callsign: form.call,
            band: form.band,
            frequency: form.freq,
            CTCSSFrequency: form.tone,
            latitude: latd,
            longitude: long,
            perimeter: form.perimeter,
            // country: revgeo?.country,
            // city: revgeo?.municipality? revgeo.municipality: revgeo?.state,
            // locality: revgeo?.suburb? revgeo.suburb: revgeo?.city,
            maidenhead: QRXMaidenhead.gridForLatLon(latd, long),
            checkIn: contactLastSession.checkIn? new Date(contactLastSession.checkIn): new Date(),
            checkOut: contactLastSession.checkOut? new Date(contactLastSession.checkOut): new Date(),
        };

        if (contactLastSession.latitude !== contactUpdatedSession.latitude ||
            contactLastSession.longitude !== contactUpdatedSession.longitude) {

            const revgeo = await reverseGeocoding(latd, long);

            console.log(revgeo);
            console.log('\n');

            contactUpdatedSession.country = revgeo?.country;
            contactUpdatedSession.city = revgeo?.municipality? revgeo.municipality: revgeo?.state;
            contactUpdatedSession.locality = revgeo?.suburb? revgeo.suburb: revgeo?.city;
        }

        if (
            contactSessionsLength < 1
            || (new Date()).getTime() > contactLastSession.checkOut.getTime()
            || contactUpdatedSession.callsign !== contactLastSession.callsign
            || contactUpdatedSession.band !== contactLastSession.band
            || contactUpdatedSession.frequency !== contactLastSession.frequency
            || contactUpdatedSession.CTCSSFrequency !== contactLastSession.CTCSSFrequency
        ) {
            console.log('First | New session...');
            console.log('\n');

            // Close current session if still open
            if (contactSessionsLength > 0 && contactSessions[lastSessionIdx].checkOut > new Date()) {
                contactSessions[lastSessionIdx].checkOut = new Date();
            }

            contactUpdatedSession.sessionId = crypto.randomUUID();
            contactUpdatedSession.checkIn = new Date();

            if (contactLastSession.checkOut > new Date()) {
                contactUpdatedSession.checkOut = new Date(contactLastSession.checkOut);
            } else {
                contactUpdatedSession.checkOut = new Date(contactUpdatedSession.checkIn);
            }

            contactUpdatedSession.checkOut = adjustAirTime(form.airTime, contactUpdatedSession.checkOut);

            contactSessions = [ ...contactSessions, {...contactUpdatedSession} ];
            
        } else {
            console.log('Current session...\n');
            console.log('\n');

            contactUpdatedSession.checkOut = adjustAirTime(form.airTime, contactUpdatedSession.checkOut);

            contactSessions[lastSessionIdx] = { ...contactUpdatedSession };
        }

        let updatedContact = {
            ...contact,
            operator: form.oper,
            sessions: [ ...contactSessions ],
        };

        handleUpdateContact(updatedContact);

        setAddEditContactFormHide(true);
    };

    function handleFormBandChange(band) {
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
            oper: contact.operator,
            id: contactLastSession.sessionId,
            call: contactLastSession.callsign,
            band: contactLastSession.band,
            freq: contactLastSession.frequency,
            tone: contactLastSession.CTCSSFrequency,
            perimeter: contactLastSession.perimeter,
            latd: contactLastSession.latitude,
            long: contactLastSession.longitude,
            airTime: contactLastSession.checkOut < new Date()? '30': null,
            freqOpt: [ ...filterFreqOpt(contactLastSession.band) ],
        });
    // eslint-disable-next-line
    }, [contact]);

    const firstContact = (contactSessionsLength < 1);

    // console.log('about to render AddEditContactForm...');
    // console.log('\n');

    return (
        <Form onSubmit={(e) => handleUpdateSession(e)}>
            {firstContact? (
                <Form.Group className="mb-2" controlId="operator">
                    <Form.Label>{t('contactForm.Operator')}</Form.Label>
                    <Form.Control value={form.oper} onChange={(e) => setForm({ ...form, oper: e.target.value })} 
                        placeholder={t('optional')} type="text" />
                    <Form.Text className="text-muted">
                        {t('contactForm.Operator.about')}
                    </Form.Text>
                </Form.Group>
            ):null}
            <Form.Group className="mb-2" controlId="airtime">
                <Form.Label>{t('contactForm.AirTime')}</Form.Label><br/>
                <Form.Check inline label='0m' value='0' onChange={(e) => setForm({ ...form, airTime: e.target.value })} 
                    checked={form.airTime === '0'} name="airtime" type='radio' id='0'/>
                <Form.Check inline label='-15m' value='-15' onChange={(e) => setForm({ ...form, airTime: e.target.value })} 
                    checked={form.airTime === '-15'} name="airtime" type='radio' id='-15'/>
                <Form.Check inline label='+30m' value='30' onChange={(e) => setForm({ ...form, airTime: e.target.value })} 
                    checked={form.airTime === '30'} name="airtime" type='radio' id='30'/>
                {firstContact? (
                    <>
                    <br/>
                    <Form.Text className="text-muted">
                        {t('contactForm.AirTime.about')}
                    </Form.Text>
                    </>
                ): null}
            </Form.Group>
            <Form.Group className="mb-2" controlId="callsign">
                <Form.Label>{t('contactForm.CallSign')}</Form.Label>
                <Form.Control value={form.call} required onChange={(e) => setForm({ ...form, call: e.target.value })} 
                    type="text" />
                {firstContact? (
                    <Form.Text className="text-muted">
                        {t('contactForm.CallSign.about')}
                    </Form.Text>
                ): null}                
            </Form.Group>
            <Form.Group className="mb-2" controlId="band">
                <Form.Label>{t('contactForm.BandAndModulation')}</Form.Label>
                <Form.Select value={form.band} required onChange={(e) => handleFormBandChange(e.target.value)}>
                    <option />
                    {bands.map((item, index) => {
                        return (
                            <option key={index} value={item.value}>{item.label}</option>
                        )
                    })}
                </Form.Select>
                {firstContact? (
                    <Form.Text className="text-muted">
                        {t('contactForm.BandAndModulation.about')}
                    </Form.Text>
                ): null}                
            </Form.Group>
            <Form.Group className="mb-2" controlId="frequency">
                <Form.Label>{t('contactForm.ChannelAndFrequency')}</Form.Label>
                <Form.Select value={form.freq} required onChange={(e) => setForm({ ...form, freq: e.target.value })}>
                    <option />
                    {form.freqOpt.map((item, index) => {
                        return (
                            <option key={index} value={item.value}>{item.label}</option>
                        )
                    })}
                </Form.Select>
                {firstContact? (
                    <Form.Text className="text-muted">
                        {t('contactForm.ChannelAndFrequency.about')}
                    </Form.Text>
                ): null}
            </Form.Group>
            <Form.Group className="mb-2" controlId="CTCSSFrequency">
                <Form.Label>{t('contactForm.CTCSSFrequency')}</Form.Label>
                <Form.Select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
                    <option value=''>({t('noTone')})</option>
                    {CTCSSFrequencies.map((item, index) => {
                        return (
                            <option key={index} value={item.value}>{item.label}</option>
                        )
                    })}
                </Form.Select>
                {firstContact? (
                    <Form.Text className="text-muted">
                        {t('contactForm.CTCSSFrequency.about')}
                    </Form.Text>
                ): null}
            </Form.Group>            
            <Form.Group className="mb-2" controlId="perimeter">
                <Form.Label>{t('contactForm.ReachabilityPerimeter')}</Form.Label><br/>
                <Form.Check inline label={t('contactForm.ReachabilityPerimeter.None')} value='' 
                    checked={!form.perimeter || form.perimeter === ''} 
                    onChange={(e) => setForm({ ...form, perimeter: e.target.value })} 
                    name="perimeter" type='radio' id='none'/>
                <Form.Check inline label={t('contactForm.ReachabilityPerimeter.Urban')} value='urban' 
                    checked={form.perimeter === 'urban'} 
                    onChange={(e) => setForm({ ...form, perimeter: e.target.value })} 
                    name="perimeter" type='radio' id='urban'/>
                <Form.Check inline label={t('contactForm.ReachabilityPerimeter.Rural')} value='rural' 
                    checked={form.perimeter === 'rural'} 
                    onChange={(e) => setForm({ ...form, perimeter: e.target.value })} 
                    name="perimeter" type='radio' id='rural'/>
                {firstContact? (
                    <>
                    <br/>
                    <Form.Text className="text-muted">
                        {t('contactForm.ReachabilityPerimeter.about')}
                    </Form.Text>
                    </>
                ): null}
            </Form.Group>
            <Form.Group className="mb-2" controlId="latitude">
                <Form.Label>{t('contactForm.Latitude')}</Form.Label>
                <Form.Control value={form.latd} required 
                    onChange={(e) => setForm({ ...form, latd: e.target.value })} type="text" />
                {firstContact? (
                    <Form.Text className="text-muted">
                        {t('contactForm.Latitude.about')}
                    </Form.Text>
                ): null}
            </Form.Group>
            <Form.Group className="mb-2" controlId="longitude">
                <Form.Label>{t('contactForm.Longitude')}</Form.Label>
                <Form.Control value={form.long} required 
                    onChange={(e) => setForm({ ...form, long: e.target.value })} type="text" />
                {firstContact? (
                    <Form.Text className="text-muted">
                        {t('contactForm.Longitude.about')}
                    </Form.Text>
                ): null}
            </Form.Group>
            <Button variant="primary" type="button" disabled={form.getPos} onClick={() => handleGetCurrentLocation()} style={{ marginLeft: '.3rem', marginBottom: '.5rem' }}>
                <FontAwesomeIcon icon={faLocationCrosshairs} size="1x" />
            </Button>
            <Button variant='primary' type="submit" onClick={() => {}} style={{ marginLeft: '.3rem', marginBottom: '.5rem' }}>
                <FontAwesomeIcon icon={faFloppyDisk} size="1x"/>
            </Button>
        </Form>
    );
}

export default AddEditContactForm;