import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useTranslation } from "react-i18next";
import React, { useState, createContext, useEffect, useLayoutEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FirebaseAuthService from './FirebaseAuthService';
import QRXLookupConfig from './QRXLookupConfig';
import LoginForm from './Components/LoginForm';
import ContactForm from './Components/ContactForm';
import ContactSessionForm from './Components/ContactSessionForm';
import QRXRadar from './Components/QRXRadar';
import QRXTable from './Components/QRXTable';
import QRXAirTime from './Components/QRXAirTime';
import FirebaseFirestoreService from './FirebaseFirestoreService';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faUserGroup, faTowerBroadcast, faGear } from "@fortawesome/free-solid-svg-icons";

export const AppContext = createContext();

export const ContactInitialState = {
  email: '',
  operator: '',
  perimeter: '',
  callsigns: [],
  sessions: [],
};

export const ContactSessionInitialState = {
  sessionId: '',
  callsign: '',
  band: '',
  frequency: 0.0,
  CTCSSFrequency: 0.0,
  radios: [],
  // radios: [
  //   { callsign: '', band: '', frequency: '', tone: '' }
  // ],
  perimeter: '',
  latitude: 0.0,
  longitude: 0.0,
  latitudeO: 0.0,
  longitudeO: 0.0,
  country: '',
  city: '',
  locality: '',
  maidenhead: '',
  checkIn: null,
  checkOut: null,
};

const dataToContact = (id, data) => {

  let sessions = [];

  for (const session of data.sessions || []) {
    session.checkIn = new Date(session.checkIn.toDate());
    session.checkOut = new Date(session.checkOut.toDate());
    sessions.push({ ...session });
  }

  const sort = {
    ...data.sort,
    field: data.sort?.field || 'Distance',
    descending: data.sort?.descending === 'true'? true: false
  }

  return {
    ...data, 
    sort: { ...sort },
    sessions: [ ...sessions ],
  };
}

function App() {

  const { t, i18n } = useTranslation();
  const [ language, setLanguage ] = useState('en');

  const [ user, setUser ] = useState(null);
  const [ myContact, setMyContact ] = useState(null);

  const [ contacts, setContacts ] = useState([]);
  const [ changedContacts, setChangedContacts ] = useState([]);
  const [ radarCenter, setRadarCenter ] = useState(null);
  
  const [ popUp, setPopUp ] = useState({
    tittle: '',
    status: '',
    message: '',
    show: false,
    showContactDetails: false,
    showSessionDetails: false,
  });

  const changeLanguageHandler = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  }

  const handleToggleShowContactDetails = () => {

    setPopUp({
      ...popUp,
      showContactDetails: !popUp.showContactDetails,
      showSessionDetails: !popUp.showContactDetails? false: popUp.showSessionDetails,
    });
  }    

  const handleToggleShowSessionDetails = () => {

    setPopUp({
      ...popUp,
      showSessionDetails: !popUp.showSessionDetails,
      showContactDetails: !popUp.showSessionDetails? false: popUp.showContactDetails,
    });
  }

  const getSessionDetails = (session, operator, center) => {

    let detailedSession = null;

    let bandDetails = null;
    let freqDetails = null;
    let toneDetails = null;

    let ghostCheckOut = new Date(session.checkOut);
    ghostCheckOut.setMinutes(
        ghostCheckOut.getMinutes() + QRXLookupConfig.ghostAirTime
    );

    let status = 'active';
    if (session.checkOut < new Date() && ghostCheckOut > new Date()) {
        status = 'inactive';
    }

    const dist = QRXLookupConfig.distance(
      center[0],
      center[1],
      session.latitude,
      session.longitude,
    ).toFixed(2);

    const bear = QRXLookupConfig.bearing(
      center[0],
      center[1],
      session.latitude,
      session.longitude,
    ).toFixed(0);

    let radios = [ ...session.radios || [] ];
    if (!radios || radios.length === 0) {
      radios = [{
        callsign: session.callsign,
        band: session.band,
        frequency: session.frequency,
        tone: session.CTCSSFrequency,
      }];
    }

    for(let r = 0; r < radios.length; r++) {

      const radio = { ...radios[r] };

      bandDetails = QRXLookupConfig.bandDetails(radio.band);
      freqDetails = QRXLookupConfig.frequencyDetails(radio.frequency);
      toneDetails = QRXLookupConfig.toneDetails(radio.tone);

      radios[r] = {
        ...radio,
        band: bandDetails?.label,
        bandPinIcon: bandDetails?.pinIcon,
        bandFontColor: bandDetails?.fontColor,
        frequency: freqDetails?.label,
        tone: toneDetails?.label,
      }
    };

    bandDetails = QRXLookupConfig.bandDetails(session.band);
    freqDetails = QRXLookupConfig.frequencyDetails(session.frequency);
    toneDetails = QRXLookupConfig.toneDetails(session.CTCSSFrequency);

    detailedSession = {
      ...session,
      ghostCheckOut: ghostCheckOut,
      operator: operator,
      distance: dist,
      bearing: bear,
      band: bandDetails?.label? bandDetails.label: '',
      bandIconFile: bandDetails?.pinIcon || '',
      frequency: freqDetails?.label || '',
      tone: toneDetails?.label || '',
      radios: radios,
      status: status,
      locality: session.locality,
      city: session.city,
      country: session.country,
    };

    return detailedSession;
  }

  const handleLoadActiveAndRecentSessions = (centerSession, excludedSessionIds = []) => {

    const center = [
      centerSession?.latitude? centerSession?.latitude: 0, 
      centerSession?.longitude? centerSession?.longitude: 0,
    ];  

    let activeSessions = [];
    
    for (let c of contacts || []) {
        
      let lastSession = null;
      if (c.sessions?.length > 0) 
        lastSession = { ...c.sessions[c.sessions.length - 1] };

      if (lastSession && !excludedSessionIds.includes(lastSession.sessionId)) {

        const detailedSession = getSessionDetails(lastSession, c.operator, center);

        let ghostCheckOut = new Date(lastSession.checkOut);
        ghostCheckOut.setMinutes(
            ghostCheckOut.getMinutes() + QRXLookupConfig.ghostAirTime
        );

        if (lastSession.checkOut > new Date() || ghostCheckOut > new Date())
          activeSessions.push(detailedSession);
      }
    }
    
    return activeSessions;
  }

  const handleIsValidCallsign = (call, pct, email) => {

    for (let c of contacts) {
      // Search within registered callsigns
      for (let call2 of c.callsigns || [])
        if (QRXLookupConfig.similarity(call, call2) > pct && email !== c.email)
          return false;
      // Search within callsigns used in sessions
      for (let sess of c.sessions || [])
        if (QRXLookupConfig.similarity(call, sess.callsign) > pct && email !== c.email)
          return false;
    }
    return true;
  }

  const handleChangeRadarCenter = (center) => {

    if (center && radarCenter 
    && center[0] === radarCenter[0] 
    && center[1] === radarCenter[1]) {

      // console.log(`Reset center...`);
      setRadarCenter(null);

    } else if (center && center.length === 2) {
      
      // console.log(`New center: ${center}`);
      setRadarCenter(center);      
    }
  }

  const handleUpdateContact = async(updatedContact) => {

    console.log(`%c> Writing 1 record to Firestore.`, 'color: red');
    console.log('\n');

    try {
        await FirebaseFirestoreService.updateDocument('contacts', updatedContact);

        setMyContact({
            ...updatedContact,
        });

    } catch (error) {
        alert(error.message);
    }

    setPopUp({
      tittle: '',
      status: '',
      message: '',
      show: false,
      showContactDetails: false,
      showSessionDetails: false,
    });
  }

  const handleDocChange = (docChanges) => {

    console.log(`%c> Reading ${docChanges.length} records from Firestore.`, 'color: red');
    console.log('\n');

    let changes = [];

    docChanges.forEach((change) => {

      const contact = dataToContact(change.doc.id, { ...change.doc.data() });

      changes = [ 
        ...changes, 
        { contact: { ...contact }, type: change.type} 
      ];

      if (user && user.email === contact.email) {
        setMyContact({ ...contact });
      }
    });

    setChangedContacts([ ...changes ]);
  }

  const handleLogout = () => {

    FirebaseAuthService.logoutUser();

    const mySessionsLength = myContact?.sessions?.length? myContact.sessions.length: 0;
    const myLastSession = mySessionsLength > 0? myContact.sessions[mySessionsLength - 1]: null;

    if (myLastSession && myLastSession?.checkOut > new Date()) {

      myLastSession.checkOut = new Date();

      myContact.sessions[mySessionsLength - 1] = { ...myLastSession };

      const updatedContact = {
        ...myContact
      };

      console.log(updatedContact);

      handleUpdateContact(updatedContact);
    }

    setPopUp({
      tittle: '',
      status: '',
      message: '',
      show: false,
      showContactDetails: false,
      showSessionDetails: false,
    });

    setMyContact(null);
    setUser(null);
  }

  useLayoutEffect(() => {

    if (!user) {

      console.log('+ No user logged in...');
      console.log('\n');

      setPopUp({
        tittle: '',
        status: '',
        message: '',
        show: false,
        showContactDetails: false,
        showSessionDetails: false,
      });

    } else if (!myContact || (myContact && myContact?.callsigns?.length < 1)) {

      console.log('+ User logged in, no profile created or zero callsign...');
      console.log('\n');

      setPopUp({
        tittle: t('profile.incomplete'),
        status: '',
        message: t('contactForm.CallSign.missing'),
        show: true,
        showContactDetails: true,
        showSessionDetails: false,
      });

    } else if (myContact && myContact?.sessions?.length < 1) {

      console.log('+ User logged in, profile created, at least one callsign, but no previous session...');
      console.log('\n');

      setPopUp({
        tittle: t('warning'),
        status: '',
        message: t('contactForm.Session.missing'),
        show: true,
        showContactDetails: false,
        showSessionDetails: true,
      });

    } else {

      console.log('+ User logged in, profile created, at least one callsign, at least one session...');
      console.log('\n');

      setPopUp({
        tittle: '',
        status: '',
        message: '',
        show: false,
        showContactDetails: false,
        showSessionDetails: false,
      });  
    }

  // eslint-disable-next-line
  }, [myContact]);

  useEffect(() => {

    setPopUp({
      tittle: '',
      status: '',
      message: '',
      show: false,
      showContactDetails: false,
      showSessionDetails: false,
    });

    const lang = localStorage.getItem("language")? localStorage.getItem("language"): 'en';
    i18n.changeLanguage(lang);
    setLanguage(lang);

    if (!user) {
      FirebaseAuthService.subscribeToAuthChanges(setUser);
    }

  // eslint-disable-next-line
  }, []);

  useEffect(() => {

    let unsubscribe = () => {};

    if (user) {

      unsubscribe = FirebaseFirestoreService.subscribeToDocChanges('contacts', handleDocChange);

      if (!myContact)
        setMyContact({ ...ContactInitialState, email: user.email });
    }
      
    return () => unsubscribe();

  // eslint-disable-next-line
  }, [user]);

  useEffect(() => {

    console.log(`+ About to process ${changedContacts.length} changed records:`);

    let changes = [ ...contacts ];

    for (const change of changedContacts) {

      const email = change.contact.email;

      if (change.type === "added" && !changes.find(elem => elem.email === email)) {
        console.log("  New contact:", change.contact);
        changes = [ ...changes,  { ...change.contact } ];
      }
  
      if (change.type === "modified" && changes.findIndex(elem => elem.email === email)) {
        console.log("  Modified contact: ", change.contact);
        const idx = contacts.findIndex(elem => elem.email === email);
        changes[idx] = { ...change.contact };
      }
  
      if (change.type === "removed") {
        console.log("  Removed contact: ", change.contact);
        changes = [
          ...changes.filter(elem => elem.email !== email)
        ];        
      }
    }

    console.log('\n');

    setContacts([ ...changes ]);

  // eslint-disable-next-line
  }, [changedContacts]);
  
  let mySessionsLength = myContact?.sessions?.length? myContact.sessions.length: 0;

  let myLastSession = mySessionsLength > 0? myContact.sessions[mySessionsLength - 1]: null;

  const activeContactSessions = myLastSession? 
    [ ...handleLoadActiveAndRecentSessions(myLastSession) ]:
    [];

  // console.log(`Lang: ${language}`);
  // console.log('\n');

  // console.log(`User: ${user}`);
  // console.log('\n');

  // console.log(`Contacts: ${contacts}`);
  // console.log('\n');
  
  // console.log('My Contact:');
  // console.log(myContact);
  // console.log('\n');

  // console.log('My Last Session:');
  // console.log(myLastSession);
  // console.log('\n');

  // console.log(`Active sessions: ${activeContactSessions}`);
  // console.log('\n');

  // console.log('about to render App...');
  // console.log('\n');

  return (
    <AppContext.Provider value={{ language }}>
      <ToastContainer className="p-3" position='bottom-center'>
        <Toast show={popUp.show} bg='dark' onClose={() => setPopUp({ ...popUp, show: false })}>
          <Toast.Header>
            <strong className="me-auto">{popUp.tittle}</strong>
            <small>{popUp.status}</small>
          </Toast.Header>
        <Toast.Body className='text-white'>{popUp.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Container className='App' fluid>
        <Row className='header'>
          <Col className='header-center' md>
            {user? (<>
              <p style={{fontFamily: 'Digital7Mono', fontSize: '300%', color: '#ffff00', margin: 0}}>
                <Button variant='primary' type="button" onClick={() => {}} style={{ marginRight: '.5rem' }}>
                  <FontAwesomeIcon icon={faUserGroup} size="1x"/>
                </Button>
                <Button variant={!popUp.showSessionDetails? 'primary': 'secondary'} type="button" onClick={handleToggleShowSessionDetails} style={{ marginRight: '.5rem' }}>
                  <FontAwesomeIcon icon={faTowerBroadcast} size="1x"/>
                </Button>
                {myLastSession?.checkOut > new Date()? 
                  <QRXAirTime countDownDate={myLastSession.checkOut} />: '00:00:00'}
                <Button variant={!popUp.showContactDetails? 'primary': 'secondary'} type="button" onClick={handleToggleShowContactDetails} style={{ marginLeft: '.5rem' }}>
                  <FontAwesomeIcon icon={faGear} size="1x"/>
                </Button>
                <Button variant="danger" type="button" onClick={handleLogout} style={{ marginLeft: '.5rem' }}>
                  <FontAwesomeIcon icon={faArrowRightFromBracket} size="1x"/>
                </Button>
              </p>
            </>):(<>
              <Form.Group className="mb-2" controlId="language">
                <Form.Check inline label='English' value='en' onChange={(e) => changeLanguageHandler(e)} 
                    checked={language === 'en'} name="language" type='radio' id='0'/>
                <Form.Check inline label='Português' value='pt' onChange={(e) => changeLanguageHandler(e)} 
                    checked={language === 'pt'} name="language" type='radio' id='-15'/>
              </Form.Group>
              <LoginForm/>
            </>)}
          </Col>
        </Row>
        {user? (
          <Row className='main'>
            <Col>
              {popUp.showContactDetails && !popUp.showSessionDetails && myContact?
                <ContactForm
                  contact={myContact} 
                  handleUpdateContact={handleUpdateContact}
                  validCallsign={handleIsValidCallsign} />
              :null}

              {popUp.showSessionDetails && !popUp.showContactDetails && myContact?
                <ContactSessionForm
                  contact={myContact} 
                  handleUpdateContact={handleUpdateContact}
                  validCallsign={handleIsValidCallsign} />
              :null}

              {!popUp.showSessionDetails && !popUp.showContactDetails & mySessionsLength > 0? (<>
                  <QRXRadar
                    contact={myContact}
                    activeContactSessions={activeContactSessions}
                    center={radarCenter} /> 
                  <QRXTable
                    contact={myContact}
                    activeContactSessions={activeContactSessions}
                    changeRadarCenter={handleChangeRadarCenter} />
              </>) :null}
            </Col>
          </Row>
        ):(
          <Row className='main'>
            <Col md='12'>
              <center>
                <b>{t('welcome')}!</b>
                <h3>{t('appName')} {t('version')} <code>{QRXLookupConfig.appVersion}</code></h3>
                <b><i>{t('readme.tittle')}?</i></b>
                <p>{t('readme')}</p>
              </center>
            </Col>
          </Row>
        )}
      </Container>
    </AppContext.Provider>
  );
}

export default App;
