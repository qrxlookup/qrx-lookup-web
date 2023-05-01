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
import QRKReport from './Components/QRKReport';
import QRXAirTime from './Components/QRXAirTime';
import FirebaseFirestoreService from './FirebaseFirestoreService';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faTowerBroadcast, faGear, faFlag } from "@fortawesome/free-solid-svg-icons";

export const AppContext = createContext();

export const ContactInitialState = {
  email: '',
  operator: '',
  perimeter: '',
  callsigns: [],
  sessions: [],
  reports: [],
};

export const ContactSessionInitialState = {
  sessionId: '',
  callsign: '',
  band: '',
  frequency: 0.0,
  CTCSSFrequency: 0.0,
  radios: [],
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
    id: id,
    ...data, 
    sort: { ...sort },
    sessions: [ ...sessions ],
  };
}

const dataToReport = (id, data) => {

  return {
    ...data, 
  };
}

function App() {

  const { t, i18n } = useTranslation();
  const [ language, setLanguage ] = useState('en');

  const [ user, setUser ] = useState(null);
  const [ myContact, setMyContact ] = useState(null);

  const [ contacts, setContacts ] = useState([]);
  const [ changedContacts, setChangedContacts ] = useState([]);
  const [ reports, setReports ] = useState([]);
  const [ changedReports, setChangedReports ] = useState([]);
  const [ radarCenter, setRadarCenter ] = useState(null);

  const [ report, setReport ] = useState({
    id: null,
    selectedRadio1: null,
    selectedRadio2: null,
    qrkRadio: null,
    qrkSignal: null,
    qslRadio: null,
    qslSignal: null,
});

  const [ popUp, setPopUp ] = useState({
    tittle: '',
    status: '',
    message: '',
    show: false,
    showContactDetails: false,
    showSessionDetails: false,
    showQRKReport: false,
  });

  const changeLanguageHandler = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  }

  const toggleShowContactDetails = () => {

    setPopUp({
      ...popUp,
      showContactDetails: !popUp.showContactDetails,
      showSessionDetails: !popUp.showContactDetails? false: popUp.showSessionDetails,
      showQRKReport: !popUp.showContactDetails? false: popUp.showQRKReport,
    });
  }    

  const toggleShowSessionDetails = () => {

    setPopUp({
      ...popUp,
      showSessionDetails: !popUp.showSessionDetails,
      showContactDetails: !popUp.showSessionDetails? false: popUp.showContactDetails,
      showQRKReport: !popUp.showSessionDetails? false: popUp.showQRKReport,
    });
  }

  const toggleShowQRKReport = () => {

    if (popUp.showQRKReport) {
      resetReport();
    }

    setPopUp({
      ...popUp,
      showQRKReport: !popUp.showQRKReport,
      showContactDetails: !popUp.showQRKReport? false: popUp.showContactDetails,
      showSessionDetails: !popUp.showQRKReport? false: popUp.showSessionDetails,
    });
  }

  const loadAllSessions = (centerSession, excludedContactIds = []) => {

    const center = [
      centerSession?.latitude? centerSession?.latitude: 0, 
      centerSession?.longitude? centerSession?.longitude: 0,
    ];  

    let sessions = [];
    
    for (let c of contacts || []) {
  
      for (const s in c.sessions) {

        const session = c.sessions[s];

        if (!excludedContactIds.includes(session.sessionId)) {
          const detailedSession = QRXLookupConfig.getSessionDetails(session, c.operator, center);
          sessions.push(detailedSession);
        }
      }
    }
    
    return sessions;
  }

  const loadRecentlyActiveSessions = (centerSession, excludedSessionIds = []) => {

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

        const detailedSession = QRXLookupConfig.getSessionDetails(lastSession, c.operator, center);

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

    if (center) {
      setRadarCenter(center);
    } else {      
      setRadarCenter(null);      
    }
  }

  const handleUpdateContact = async(updatedContact) => {

    console.log(`%c> Writing 1 record to Firestore.`, 'color: red');
    console.log('\n');

    console.log(updatedContact);

    try {
        await FirebaseFirestoreService.updateDocument('contacts', updatedContact);

        setMyContact({
            ...updatedContact,
        });

    } catch (error) {
        alert(error.message);
        throw error;
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

  const handleUpdateReport = async(updatedReport) => {

    console.log(`%c> Writing 1 record to Firestore.`, 'color: red');
    console.log('\n');

    try {
        await FirebaseFirestoreService.updateDocument('reports', updatedReport);

    } catch (error) {
        alert(error.message);
    }

    // setPopUp({
    //   tittle: '',
    //   status: '',
    //   message: '',
    //   show: false,
    //   showContactDetails: false,
    //   showSessionDetails: false,
    // });
  }

  const handleContactChanged = (docChanges) => {

    console.log(`%c> Reading ${docChanges.length} records from Contacts.`, 'color: red');
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

  const handleReportChanged = (docChanges) => {

    console.log(`%c> Reading ${docChanges.length} records from Reports.`, 'color: red');
    console.log('\n');

    let changes = [];

    docChanges.forEach((change) => {

      const report = dataToReport(change.doc.id, { ...change.doc.data() });

      changes = [ 
        ...changes, 
        { report: { ...report }, type: change.type } 
      ];
    });

    setChangedReports([ ...changes ]);
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

  const resetReport = () => {

    setReport({
        id: null,
        selectedRadio1: null, 
        selectedRadio2: null,
        qrkRadio: null,
        qrkSignal: null,
        qslRadio: null,
        qslSignal: null,                    
    });
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

    let unsubscribe1 = () => {};
    let unsubscribe2 = () => {};

    if (user) {

      unsubscribe1 = FirebaseFirestoreService.subscribeToDocChanges('contacts', handleContactChanged);
      unsubscribe2 = FirebaseFirestoreService.subscribeToDocChanges('reports', handleReportChanged);

      if (!myContact)
        setMyContact({ ...ContactInitialState, email: user.email });
    }
      
    return () => { 
      unsubscribe1();
      unsubscribe2();
    }

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
  
  useEffect(() => {

    console.log(`+ About to process ${changedReports.length} changed records:`);

    let changes = [ ...reports ];

    for (const change of changedReports) {

      const reportId = change.report.id;

      if (change.type === "added" && !changes.find(elem => elem.id === reportId)) {
        console.log("  New report:", change.report);
        changes = [ ...changes,  { ...change.report } ];
      }
  
      if (change.type === "modified" && changes.findIndex(elem => elem.id === reportId)) {
        console.log("  Modified report: ", change.report);
        const idx = reports.findIndex(elem => elem.id === reportId);
        changes[idx] = { ...change.report };
      }
  
      if (change.type === "removed") {
        console.log("  Removed report: ", change.report);
        changes = [
          ...changes.filter(elem => elem.id !== reportId)
        ];        
      }
    }

    console.log('\n');

    setReports([ ...changes ]);

  // eslint-disable-next-line
  }, [changedReports]);

  let mySessionsLength = myContact?.sessions?.length? myContact.sessions.length: 0;

  let myLastSession = mySessionsLength > 0? myContact.sessions[mySessionsLength - 1]: null;

  const recentActiveSessions = myLastSession? 
    [ ...loadRecentlyActiveSessions(myLastSession) ]:
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
              <span style={{fontFamily: 'Digital7Mono', fontSize: '250%', color: '#ffff00', margin: 0}}>
                <Button variant={!popUp.showQRKReport? 'primary': 'secondary'} type="button" onClick={toggleShowQRKReport} style={{ marginRight: '.5rem' }}>
                  <FontAwesomeIcon icon={faFlag} size="1x"/>
                </Button>

                <Button variant={!popUp.showSessionDetails? 'primary': 'secondary'} type="button" onClick={toggleShowSessionDetails} style={{ marginRight: '.5rem' }}>
                  <FontAwesomeIcon icon={faTowerBroadcast} size="1x"/>
                </Button>

                <QRXAirTime countDownDate={myLastSession?.checkOut} />

                <Button variant={!popUp.showContactDetails? 'primary': 'secondary'} type="button" onClick={toggleShowContactDetails} style={{ marginLeft: '.5rem' }}>
                  <FontAwesomeIcon icon={faGear} size="1x"/>
                </Button>

                <Button variant="danger" type="button" onClick={handleLogout} style={{ marginLeft: '.5rem' }}>
                  <FontAwesomeIcon icon={faArrowRightFromBracket} size="1x"/>
                </Button>
              </span>
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
              {popUp.showContactDetails && !popUp.showSessionDetails && !popUp.showQRKReport && myContact?
                <ContactForm
                  contact={myContact} 
                  handleUpdateContact={handleUpdateContact}
                  validCallsign={handleIsValidCallsign} />
              :null}

              {popUp.showSessionDetails && !popUp.showContactDetails && !popUp.showQRKReport && myContact?
                <ContactSessionForm
                  contact={myContact} 
                  handleUpdateContact={handleUpdateContact}
                  validCallsign={handleIsValidCallsign} />
              :null}

              {popUp.showQRKReport && !popUp.showSessionDetails && !popUp.showContactDetails && myContact?
                <QRKReport
                  contact={myContact}
                  reports={reports}
                  reportId={report.id}
                  reportRadio1={report.selectedRadio1}
                  reportRadio2={report.selectedRadio2}
                  reportQRKRadio={report.qrkRadio}
                  reportQRKSignal={report.qrkSignal}
                  reportQSLRadio={report.qslRadio}
                  reportQSLSignal={report.qslSignal}

                  allSessions={!report.selectedRadio2? 
                    loadAllSessions(myLastSession, myContact.sessions.map((s) => {
                      return s.sessionId;
                    }))
                    :recentActiveSessions
                  }
                  toggleShowQRKReport={toggleShowQRKReport}
                  handleUpdateReport={handleUpdateReport} />
              :null}

              {!popUp.showSessionDetails && !popUp.showContactDetails && !popUp.showQRKReport && mySessionsLength > 0? (<>
                  <QRXRadar
                    contact={myContact}
                    activeContactSessions={recentActiveSessions}
                    center={radarCenter} /> 
                  <QRXTable
                    contact={myContact}
                    reports={reports}
                    activeContactSessions={recentActiveSessions}
                    initializeReport={setReport}
                    changeRadarCenter={handleChangeRadarCenter}
                    toggleShowQRKReport={toggleShowQRKReport} />
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
