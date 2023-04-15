import { useTranslation } from "react-i18next";

import { useState, useEffect } from 'react';
import update from 'immutability-helper';

import QRXLookupConfig from '../QRXLookupConfig';
import QRXMaidenhead from '../QRXMaidenhead';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";

import { ContactSessionInitialState } from '../App';
  
// eslint-disable-next-line
const reverseGeocoding = async (latitude, longitude) => {

    console.log(`%c> Reverse geocode request for ${latitude}, ${longitude}`, 'color: red');
    console.log('\n');

    const apiURL = QRXLookupConfig.geoapifyURL(latitude, longitude)

    const response = await fetch(apiURL);

    // TODO: Check status of fetch...
    // {response.status_code}

    const data = await response.json();

    let revgeo = data.features[0].properties;

    console.log(revgeo);
    console.log('\n');

    let country = '';
    let countryCode = '';
    let city = '';
    let locality = '';

    if (revgeo?.country) country = revgeo.country;

    if (revgeo?.country_code) countryCode = revgeo.country_code.toUpperCase();

    if (revgeo?.municipality) city = revgeo.municipality;
    else if (revgeo?.city) city = revgeo.city;
    else if (revgeo?.county) city = revgeo.county;

    if (revgeo?.neighbourhood) locality = revgeo.neighbourhood;
    else if (revgeo?.suburb) locality = revgeo.suburb;
    else if (revgeo?.city) locality = revgeo.city;

    return { country, countryCode, city, locality };
}

function ContactSessionForm({ contact, handleUpdateContact, validCallsign }) {

    const { t } = useTranslation();

    let sessions = contact? [ ...contact.sessions ]: [];
    const sessionsLength = sessions?.length? sessions.length: 0;
    const lastSession  = sessionsLength > 0?
        { ...sessions[sessionsLength - 1] }:
        { ...ContactSessionInitialState };

    const callsigns = contact? [ ...contact.callsigns.sort() ]: [];

    const bands = QRXLookupConfig.bands;
    const bandFrequencies = QRXLookupConfig.bandFrequencies;
    const CTCSSFrequencies = QRXLookupConfig.CTCSSFrequencies;

    let radios = lastSession.radios;
    if (!radios) {
        radios = [{
            callsign: lastSession.callsign || contact.callsigns[0],
            band: lastSession.band,
            frequency: lastSession.frequency,
            tone: lastSession.CTCSSFrequency,
        }];
    }

    if (radios && radios.length === 0) {
        radios = [
            ...radios,
            { callsign: callsigns[0], band: '', frequency: '', tone: '' }
        ];
    }

    const [form, setForm] = useState({
        id: lastSession.sessionId,
        airTime: lastSession.checkOut < new Date()? '30': null,
        radios: radios,
        activeRadio: 0,
        call: radios[0]?.callsign || '',
        band: radios[0]?.band || '',
        freq: radios[0]?.frequency || '',
        tone: radios[0]?.tone || '',
        latd: lastSession.latitude,
        long: lastSession.longitude,
        freqOpt: [ ...filterFreqOpt(lastSession.band) ],
        getPos: false,
    });

    const setFormField = (field, value) => {

        if (['call', 'band', 'freq', 'tone'].includes(field)) {

            const r = form.activeRadio;

            let field2 = null;
            if (field === 'call') field2 = 'callsign';
            if (field === 'band') field2 = 'band';
            if (field === 'freq') field2 = 'frequency';
            if (field === 'tone') field2 = 'tone';

            setForm({
                ...form,
                [field]: value,
                radios: update(form.radios, { [r]: {[field2]: { $set: value } }}),
            });

        } else {

            setForm({
                ...form,
                [field]: value
            });    
        }

        if ( !!formErrors[field] ) setFormErrors({
            ...formErrors,
            [field]: null
        });
    }

    const [ formErrors, setFormErrors ] = useState({});

    const findFormErrors = () => {

        const newErrors = {};

        const { call, band, freq, latd, long } = form;
        
        if ( !call || call === '' ) newErrors.call = 'mandatory';
        else if ( !validCallsign(call, QRXLookupConfig.similarityPct, contact.email) ) newErrors.call = 'contactForm.CallSign.similar';

        if ( !band || band === '' ) newErrors.band = 'mandatory';

        if ( !freq || freq === '' ) newErrors.freq = 'mandatory';

        const radio = form.radios[form.activeRadio];
        for (let r = 0; r < form.radios.length; r++) {
            if (radio.band === form.radios[r].band &&
                radio.frequency === form.radios[r].frequency &&
                r !== form.activeRadio)
                newErrors.freq = 'contactForm.Frequency.busy';
            break;
        }

        if ( !latd || latd === '' ) newErrors.latd = 'mandatory';
        else if (isNaN(parseFloat(latd)) || 
                parseFloat(latd) < -90 || parseFloat(latd) > 90) newErrors.latd = 'contactForm.latitude.invalid';

        if ( !long || long === '' ) newErrors.long = 'mandatory';
        else if (isNaN(parseFloat(long)) || 
                parseFloat(long) < -180 || parseFloat(long) > 180) newErrors.long = 'contactForm.longitude.invalid';

        return newErrors
    }

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
        } else if (!band) {
            filtered = [ ...bandFrequencies ];
        }
        return filtered;
    }

    // function filterBusyFreqOpt(freqOpt, keep) {
    //     let filteredFreqOpt = Object.assign(freqOpt);
    //     form.radios.forEach(radio => {
    //         filteredFreqOpt = filteredFreqOpt.filter(
    //             freq => freq.value !== radio.frequency || freq.value === keep
    //         );
    //     });
    //     return filteredFreqOpt;
    // }

    // function filterContactCallsigns(keep) {
    //     let filteredCallsigns = Object.assign(contactCallsigns);
    //     form.radios.forEach(elem => {
    //         filteredCallsigns = filteredCallsigns.filter(call => call !== elem.callsign || call === keep);
    //     });
    //     return filteredCallsigns;
    // }

    const handleGetCurrentLocation = () => {
        setForm({
            ...form,
            getPos: true,
        });
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(handleUpdatePosition, handleCurrentLocationError);
        }
    }

    const handleChangeRadio = (dest) => {

        const newErrors = findFormErrors();

        if ( Object.keys(newErrors).length > 0 ) {

            setFormErrors(newErrors);

        } else {

            setForm({
                ...form,
                activeRadio: dest,
            });
        }
    }

    const handleAddRadio = () => {

        const newErrors = findFormErrors();

        if ( Object.keys(newErrors).length > 0 ) {
            setFormErrors(newErrors);
        } else {

            setForm({
                ...form,
                // radios: update(form.radios, {$push: [
                //     { callsign: filterContactCallsigns(null)[0], band: '', frequency: '', tone: ''}
                // ]}),
                radios: update(form.radios, {$push: [
                    { callsign: callsigns[0], band: '', frequency: '', tone: ''}
                ]}),                
                activeRadio: form.radios.length,
            });
        }
    }

    const handleRemoveRadio = () => {

        const idx = form.activeRadio;

        setForm({
            ...form,
            radios: update(form.radios, {$splice: [[idx, 1]]}),
            activeRadio: 0,
        });
    }

    const handleUpdatePosition = (position) => {
        setForm({
            ...form,
            latd: Math.fround(position.coords.latitude),
            long: Math.fround(position.coords.longitude),
            getPos: false,
        });

        if ( !!formErrors['latd'] || !!formErrors['long'] ) setFormErrors({
            ...formErrors,
            'latd': null,
            'long': null,
        });        
    }

    const handleCurrentLocationError = (error) => {
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

    const adjustAirTime = (adjustement, endTime) => {

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

    const areTheseRadiosTunned = (r1, r2) => {

        if (r1.band === r2.band && r1.frequency === r2.frequency && r1.tone === r2.tone) {

            return { listens: true, listened: true };

        } else if (r1.band === r2.band && r1.frequency === r2.frequency && r1.tone && !r2.tone) {

            return { listens: false, listened: true };

        } else if (r1.band === r2.band && r1.frequency === r2.frequency && !r1.tone && r2.tone) {

            return { listens: true, listened: false };
        } 

        return { listens: false, listened: false };
    }

    // eslint-disable-next-line
    const sessionPeriodOverlap = (s1, s2) => {

        // if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
        // if (a_start <= b_end   && b_end   <= a_end) return true; // b ends in a
        // if (b_start <  a_start && a_end   <  b_end) return true; // a in b

        if (s1.checkIn <= s2.checkIn  && s2.checkIn  <= s1.checkOut) return true;
        if (s1.checkIn <= s2.checkOut && s2.checkOut <= s1.checkOut) return true;
        if (s2.checkIn <  s1.checkIn  && s1.checkOut <  s2.checkOut) return true;

        return false;
    }
    
    const changedRadioSession = (s1, s2) => {

        if (!s1 || !s2 || !s1.radios || !s2.radios || s1.radios.length !== s2.radios.length)
            return true;
        
        let allEqual = true;
        for (let ri = 0; ri < s1.radios.length; ri++) {

            const r1 = s1.radios[ri];

            let oneEqual = false;
            for (let rj = 0; rj < s2.radios.length; rj++) {
                
                const r2 = s2.radios[rj];

                const tunned = areTheseRadiosTunned(r1, r2);

                oneEqual = 
                    (r1.callsign === r2.callsign && tunned.listens && tunned.listened) | oneEqual;
            }

            allEqual = oneEqual && allEqual;
        }

        return !allEqual;
    }
    
    const handleSaveSession = async (e) => {
        e.preventDefault();

        const newErrors = findFormErrors();

        if ( Object.keys(newErrors).length > 0 ) {

            setFormErrors(newErrors);

        } else {

            const lastSessionIdx = sessionsLength > 0? sessionsLength - 1: 0;

            const latd = Math.fround(form.latd);
            const long = Math.fround(form.long);

            let updatedSession = {
                sessionId: form.id,
                callsign: form.call || callsigns[0],
                band: form.band,
                frequency: form.freq,
                CTCSSFrequency: form.tone,
                radios: form.radios,
                latitude: latd,
                longitude: long,
                latitudeO: 0.0,
                longitudeO: 0.0,
                maidenhead: QRXMaidenhead.gridForLatLon(latd, long),
                checkIn: lastSession.checkIn? new Date(lastSession.checkIn): new Date(),
                checkOut: lastSession.checkOut? new Date(lastSession.checkOut): new Date(),
            };

            if (lastSession.latitude !== updatedSession.latitude ||
                lastSession.longitude !== updatedSession.longitude) {

                const data = await reverseGeocoding(latd, long);

                updatedSession.country = data.country || '';
                updatedSession.countryCode = data.countryCode || '';
                updatedSession.city = data.city || '';
                updatedSession.locality = data.locality || '';

                const band = form.band? QRXLookupConfig.bands.find(elem => elem.value === form.band): null;
                const bandOffset = band? band.offset: 0;
    
                const [ latdO, longO ] = QRXLookupConfig.randomOffsetWithin(
                    // radius
                    bandOffset,
                    // center
                    [latd, long]
                );

                updatedSession.latitudeO = latdO;
                updatedSession.longitudeO = longO;

            } else {
                updatedSession.country = lastSession.country || '';
                updatedSession.countryCode = lastSession.countryCode || '';
                updatedSession.city = lastSession.city || '';
                updatedSession.locality = lastSession.locality || '';
            }

            console.log(`+ Changed radio session: ${changedRadioSession(lastSession, updatedSession)}`);
            console.log('\n');

            // if (
            //     sessionsLength < 1
            //     || (new Date()).getTime() > lastSession.checkOut.getTime()
            //     || updatedSession.callsign !== lastSession.callsign
            //     || updatedSession.band !== lastSession.band
            //     || updatedSession.frequency !== lastSession.frequency
            //     || updatedSession.CTCSSFrequency !== lastSession.CTCSSFrequency
            // ) {
            if (new Date() > lastSession.checkOut || changedRadioSession(lastSession, updatedSession)) {

                if (sessionsLength > 0 && sessions[lastSessionIdx].checkOut > new Date()) {
                    sessions[lastSessionIdx].checkOut = new Date();
                }

                updatedSession.sessionId = crypto.randomUUID();
                updatedSession.checkIn = new Date();

                if (lastSession.checkOut > new Date()) {
                    updatedSession.checkOut = new Date(lastSession.checkOut);
                } else {
                    updatedSession.checkOut = new Date(updatedSession.checkIn);
                }

                updatedSession.checkOut = adjustAirTime(form.airTime, updatedSession.checkOut);

                sessions = [ ...sessions, {...updatedSession} ];

                console.log(`+ First | New session: ${updatedSession.sessionId}`);
                console.log('\n');
                
            } else {

                updatedSession.checkOut = adjustAirTime(form.airTime, updatedSession.checkOut);

                sessions[lastSessionIdx] = { ...updatedSession };

                console.log(`+ Current session: ${updatedSession.sessionId}`);
                console.log('\n');
            }

            let updatedContact = {
                ...contact,
                sessions: [ ...sessions ],
            };
            
            handleUpdateContact(updatedContact);
        }
    };

    function handleFormBandChange(band) {

        // const r = form.activeRadio;

        const freq = form.band?.startsWith('cb.11m') && band.startsWith('cb.11m')? form.freq: '';
        
        // setForm({
        //     ...form,
        //     band: band,
        //     freq: freq,
        //     tone: '',
        //     freqOpt: [ ...filterFreqOpt(band) ],
        //     radios: update(form.radios, { [r]: {['band']: {$set: band } }}),
        // });

        setForm({
            ...form,
            band: band,
            freq: freq,
            tone: '',
            freqOpt: [ ...filterFreqOpt(band) ],
            radios: form.radios.map((radio, idx) => {
                if (idx === form.activeRadio)
                  return {...radio, band: band };
                return radio;
            }),
        });

        if ( !!formErrors['band'] ) setFormErrors({
            ...formErrors,
            'band': null,
        });
    };

    useEffect(() => {

        const r = form.activeRadio;
        const freqOpt = form.radios[r]? filterFreqOpt(form.radios[r].band): [];

        setForm({
            ...form,
            call: form.radios[r]?.callsign || callsigns[0],
            band: form.radios[r]?.band,
            freq: form.radios[r]?.frequency,
            tone: form.radios[r]?.tone,
            freqOpt: [ ...freqOpt ],
        });

    // eslint-disable-next-line
    }, [form.activeRadio]);

    const activeRadio = form.activeRadio;

    let remainingAirTime = 0;
    if (lastSession.checkOut > new Date()) 
        remainingAirTime = Math.floor((lastSession.checkOut - new Date()) / 60000);
    
    let pages = [];
    for (let r = 0; r < form.radios.length; r++) {
        // const radio = form.radios[r];
        // const bandDetails = QRXLookupConfig.bandDetails(radio.band);
        // const freqDetails = QRXLookupConfig.frequencyDetails(radio.frequency);
        pages.push(
            <Pagination.Item key={r} active={r === form.activeRadio} 
                onClick={() => handleChangeRadio(r)}>
                {`R${r + 1}`}
                {/* {r === form.activeRadio || !bandDetails?
                    `R${r + 1}`:
                    `R${r + 1} ${bandDetails.label}`
                } */}
            </Pagination.Item>,
        );
    }

    return (
        <Form noValidate onSubmit={(e) => handleSaveSession(e)}>
            
            {form?.radios?.length < QRXLookupConfig.maxRadios?
                <a href='/#' onClick={() => handleAddRadio()}>{`${t('add')} radio`}</a>
                :<i>{`${t('add')} radio`}</i>
            }

            {<> | </>}
            
            {form?.radios?.length > 1?
                <a href='/#' onClick={() => handleRemoveRadio()}>
                    {`${t('remove')} radio R${activeRadio + 1}`}
                </a>
                :<i>{`${t('remove')} radio R${activeRadio + 1}`}</i>
            }
            <hr/>

            <Pagination>{pages}</Pagination>

            {/* CALLSIGN */}
            <Form.Group className="mb-2" controlId="callsign">
                <Form.Label>{t('contactForm.CallSign')}</Form.Label>
                <Form.Select value={form.call}
                    onChange={(e) => setFormField('call', e.target.value)} isInvalid={ !!formErrors.call }>
                    {/* {filterContactCallsigns(form.call)?.map((item, idx) => { */}
                    {callsigns?.map((item, idx) => {
                        return (
                            <option key={idx} value={item}>{item}</option>
                        )
                    })}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{t(formErrors.call)}!</Form.Control.Feedback>
            </Form.Group>

            {/* BAND */}
            <Form.Group className="mb-2" controlId="band">
                <Form.Label>
                    {t('contactForm.BandAndModulation')}
                </Form.Label>
                <Form.Select value={form.band}
                    onChange={(e) => handleFormBandChange(e.target.value)} isInvalid={ !!formErrors.band }>
                    <option />
                    {bands.map((item, index) => {
                        return (
                            <option key={index} value={item.value} style={{color: item.color}}>
                                {item.label}
                            </option>
                        )
                    })}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{t(formErrors.band)}!</Form.Control.Feedback>
            </Form.Group>

            {/* FREQUENCY */}
            <Form.Group className="mb-2" controlId="frequency">
                <Form.Label>{t('contactForm.ChannelAndFrequency')}</Form.Label>
                <Form.Select value={form.freq} 
                    onChange={(e) => setFormField('freq', e.target.value)}
                    isInvalid={ !!formErrors.freq }>
                    <option />
                    {form.freqOpt.map((item, index) => {
                        return (
                            <option key={index} value={item.value}>{item.label}</option>
                        )
                    })}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{t(formErrors.freq)}!</Form.Control.Feedback>
            </Form.Group>

            {/* CTCSS-TONE */}
            {['pmr.70cm-fm', 'lpd.70cm-fm'].includes(form.band)? (
            <Form.Group className="mb-2" controlId="tone">
                <Form.Label>{t('contactForm.CTCSSFrequency')}</Form.Label>
                <Form.Select value={form.tone} onChange={(e) => setFormField('tone', e.target.value)}>
                    <option value=''>({t('noTone')})</option>
                    {CTCSSFrequencies.map((item, index) => {
                        return (
                            <option key={index} value={item.value}>{item.label}</option>
                        )
                    })}
                </Form.Select>
            </Form.Group>
            ): null}

            <hr/>

            {/* AIR-TIME */}
            <Form.Group className="mb-2" controlId="airtime">
                <Form.Label>{t('contactForm.AirTime')}</Form.Label><br/>
                <Form.Check inline disabled={remainingAirTime < 1} 
                    name="airtime" type='radio' id='0'
                    label='0m' value='0'
                    checked={form.airTime === '0'} 
                    onChange={(e) => setFormField('airTime', e.target.value)} />
                <Form.Check inline disabled={remainingAirTime < Math.abs(QRXLookupConfig.lessAirTime)} 
                    name="airtime" type='radio' id={QRXLookupConfig.lessAirTime}
                    label={`${QRXLookupConfig.lessAirTime}m`} value={QRXLookupConfig.lessAirTime}
                    checked={parseInt(form.airTime) === QRXLookupConfig.lessAirTime}
                    onChange={(e) => setFormField('airTime', e.target.value)} />
                <Form.Check inline disabled={remainingAirTime > QRXLookupConfig.criticalAirTime}  
                    name="airtime" type='radio' id={QRXLookupConfig.extraAirTime}
                    label={`+${QRXLookupConfig.extraAirTime}m`} value={QRXLookupConfig.extraAirTime}
                    checked={parseInt(form.airTime) === QRXLookupConfig.extraAirTime}
                    onChange={(e) => setFormField('airTime', e.target.value)} />
            </Form.Group>

            <hr/>

            <table style={{width: '100%'}}>
                <tbody>
                    <tr>
                        <td>
            {/* LATITUDE */}
            <Form.Group className="mb-2" controlId="latitude">
                <Form.Label>{t('contactForm.Latitude')}</Form.Label>&nbsp;
                {form.getPos? <Spinner animation="border" variant="secondary" size="sm"/>: null}
                <Form.Control value={form.latd} type="number"
                    onChange={(e) => setFormField('latd', e.target.value)} 
                    isInvalid={ !!formErrors.latd }/>
                <Form.Control.Feedback type="invalid">{t(formErrors.latd)}!</Form.Control.Feedback>
            </Form.Group>
                        </td>
                        <td>
            {/* LONGITUDE */}
            <Form.Group className="mb-2" controlId="longitude">
                <Form.Label>{t('contactForm.Longitude')}</Form.Label>&nbsp;
                {form.getPos? <Spinner animation="border" variant="secondary" size="sm"/>: null}
                <Form.Control value={form.long} type="number"
                    onChange={(e) => setFormField('long', e.target.value)} 
                    isInvalid={ !!formErrors.long }/>
                <Form.Control.Feedback type="invalid">{t(formErrors.long)}!</Form.Control.Feedback>
            </Form.Group>
                        </td>
                    </tr>
                </tbody>
            </table>

            <Button type="button" disabled={form.getPos} style={{ marginLeft: '.3rem', marginBottom: '.5rem' }} onClick={() => handleGetCurrentLocation()}>
                <FontAwesomeIcon icon={faLocationCrosshairs} size="1x" />
            </Button>
            <Button type="submit" disabled={form.getPos} style={{ marginLeft: '.3rem', marginBottom: '.5rem' }}>
                <FontAwesomeIcon icon={faFloppyDisk} size="1x"/>
            </Button>
        </Form>
    );
}

export default ContactSessionForm;