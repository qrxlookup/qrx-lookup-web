import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useTranslation } from "react-i18next";
import React, { useState, createContext, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FirebaseAuthService from './FirebaseAuthService';
import QRXLookupConfig from './QRXLookupConfig';
import LoginForm from './Components/LoginForm';
import AddEditContactForm from './Components/AddEditContactForm';
import QRXRadar from './Components/QRXRadar';
import QRXTable from './Components/QRXTable';
import QRXAirTime from './Components/QRXAirTime';
import FirebaseFirestoreService from './FirebaseFirestoreService';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faPen } from "@fortawesome/free-solid-svg-icons";

export const ContactContext = createContext();

export const ContactInitialState = {
  email: '',
  operator: '',
  sessions: [],
};

export const ContactSessionInitialState = {
  SessionId: '',
  callsign: '',
  band: '',
  frequency: 0.0,
  CTCSSFrequency: 0.0,
  perimeter: '',
  latitude: '',
  longitude: '',
  country: '',
  city: '',
  locality: '',
  maidenhead: '',
  checkIn: null,
  checkOut: null,
};

const DataToContact = (id, data) => {

  let sessions = [];

  for (const session of data.sessions) {
    session.checkIn = new Date(session.checkIn.toDate());
    session.checkOut = new Date(session.checkOut.toDate());
    sessions.push({ ...session });
  }

  return {
    ...data, 
    sessions: [ ...sessions ],
  };
}

function App() {

  const version = '1.0-beta';

  let lang = 'en';
  const { t, i18n } = useTranslation();
  const [ language, setLanguage ] = useState(lang);

  const bands = QRXLookupConfig.bands;
  const bandFrequencies = QRXLookupConfig.bandFrequencies;
  const CTCSSFrequencies = QRXLookupConfig.CTCSSFrequencies;

  const [ user, setUser ] = useState(null);
  const [ contacts, setContacts ] = useState([]);
  const [ myContact, setMyContact ] = useState(ContactInitialState);
  const [ addEditContactFormHide, setAddEditContactFormHide ] = useState(false);

  let activeContactSessions = [];
  let mySessionsLength = 0;
  let myLastSession = null;
  let myLastSessionCenter = [];

  let band = null;
  let freq = null;
  let tone = null;

  let bandPerimeter = null;

  const changeLanguageHandler = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  }

  function handleToggleShowHideForm() {
    setAddEditContactFormHide(!addEditContactFormHide);
  }    

  function handleGetMyContact() {
    const contact = contacts.find(elem => elem.email === user?.email);
    if (user && contact) {
      setMyContact({ ...contact });
    } else {
      setMyContact({ email: user?.email, sessions: [] });
    }
  }

  function handleGetActiveSessions() {

    let active = [];
    
    for (let c of contacts) {
        for (let s of c.sessions) {
            if (s.checkOut > new Date()) {
                s.operator = c.operator;
                active = [ ...active, { ...s } ];
            }
        }
    }
    
    return active;
  }

  async function handleUpdateContact(updatedContact) {

    try {
        await FirebaseFirestoreService.updateDocument('contacts', updatedContact);

        setMyContact({
            ...updatedContact,
        });

    } catch (error) {
        alert(error.message);
    }
  }

  function handleDocChange(docChanges) {

    docChanges.forEach((change) => {

      const contact = DataToContact(change.doc.id, { ...change.doc.data() });

      /* Handle added contacts */
      if (change.type === "added") {

        // console.log("New contact:", contact);
        // console.log('\n');

        if (!contacts.find(elem => elem.email === contact.email))
          setContacts([ ...contacts, { ...contact } ]);
      }
      /* Handle modified contacts */
      if (change.type === "modified") {

        // console.log("Modified contact: ", contact);
        // console.log('\n');

        const updateContacts = [ ...contacts ];

        const idx = updateContacts.findIndex(elem => elem.email === contact.email);

        if (idx !== -1) {
          updateContacts[idx] = { ...contact };
          setContacts([ ...updateContacts ]);
        }
      }
      /* Handle deleted contacts */
      if (change.type === "removed") {

        // console.log("Removed contact: ", contact);
        // console.log('\n');

        setContacts([
          ...contacts.filter(elem => elem.email !== contact.email)
        ]);
      }
    });
  }

  function handleLogout() {
    FirebaseAuthService.logoutUser();
    setMyContact(ContactInitialState);
  }

  useEffect(() => {

    lang = localStorage.getItem("language")? localStorage.getItem("language"): 'en';
    setLanguage(lang);
    i18n.changeLanguage(lang);

    FirebaseAuthService.subscribeToAuthChanges(setUser);

    handleGetMyContact();

  // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    
    const unsubscribe = FirebaseFirestoreService.subscribeToDocChanges('contacts', handleDocChange);

    handleGetMyContact();
  
    return () => unsubscribe();

  // eslint-disable-next-line
  }, [contacts]);

  activeContactSessions = [ ...handleGetActiveSessions() ];

  mySessionsLength = myContact?.sessions?.length? myContact.sessions.length: 0;

  myLastSession = mySessionsLength > 0? myContact.sessions[mySessionsLength - 1]: null;

  myLastSessionCenter = [
    myLastSession?.latitude? myLastSession?.latitude: 0, 
    myLastSession?.longitude? myLastSession?.longitude: 0,
  ];

  band = myLastSession? bands.find(elem => elem.value === myLastSession.band): null;
  freq = myLastSession? bandFrequencies.find(elem => elem.value === myLastSession.frequency): null;
  tone = myLastSession? CTCSSFrequencies.find(elem => elem.value === myLastSession.CTCSSFrequency): null;

  bandPerimeter = band? band.range[myLastSession.perimeter]: null;

  // console.log('User:');
  // console.log(user);
  // console.log('\n');

  // console.log('Contacts:');
  // console.log(contacts);
  // console.log('\n');
  
  // console.log('My Contact:');
  // console.log(myContact);
  // console.log('\n');

  // console.log('My Last Session:');
  // console.log(myLastSession);
  // console.log('\n');

  // console.log('Active sessions:');
  // console.log(activeContactSessions);
  // console.log('\n');

  // console.log('about to render App...');
  // console.log('\n');

  return (
    <ContactContext.Provider value={{ myContact, setMyContact, addEditContactFormHide, setAddEditContactFormHide }}>
      <Container className='App' fluid>
        <Row className='header'>
          {/* <Col className='header-left' md></Col> */}
          <Col className='header-center' md>
            {user? (
              <>
              {myLastSession? (
              <p>
                <span style={{ fontSize: '80%' }}>{band ? `${band.label} ` : null}</span>
                <span style={{ color: '#ffff00', fontSize: '130%' }}>{freq ? freq.label : null}</span>
                <span style={{ fontSize: '80%' }}>{tone ? ` ${tone.label}` : ` (${t('noTone')})`}</span>
              </p>
              ): (
                null
              )}
              <p>
                <Button variant={addEditContactFormHide? 'primary': 'secondary'} type="button" onClick={handleToggleShowHideForm} style={{ marginRight: '.5rem' }}>
                  <FontAwesomeIcon icon={faPen} size="1x"/>
                </Button>
                {myLastSession?.checkOut > new Date()? 
                  <QRXAirTime countDownDate={myLastSession.checkOut} />: ' 00h | 00m | 00s '}
                {myLastSession?.callsign?
                  <code>{` ${myLastSession.callsign}`}</code>: null}
                <Button variant="primary" type="button" onClick={handleLogout} style={{ marginLeft: '.5rem' }}>
                  <FontAwesomeIcon icon={faArrowRightFromBracket} size="1x"/>
                </Button>
              </p>
              </>
            ):(
              <>              
              <p className="title">QRX Lookup {t('version')} <i>{version}</i></p>
              <Form.Group className="mb-2" controlId="language">
                <Form.Check inline label='English' value='en' onChange={(e) => changeLanguageHandler(e)} 
                    checked={language === 'en'} name="language" type='radio' id='0'/>
                <Form.Check inline label='Português' value='pt' onChange={(e) => changeLanguageHandler(e)} 
                    checked={language === 'pt'} name="language" type='radio' id='-15'/>
              </Form.Group>
              <LoginForm/>
              </>
            )}
          </Col>
          {/* <Col className='header-right' md></Col> */}
        </Row>
        {user? (
          <Row className='main'>
            <Col md='3'>
              {!addEditContactFormHide?
                <AddEditContactForm
                  contact={myContact} 
                  handleUpdateContact={handleUpdateContact} 
                  setAddEditContactFormHide={setAddEditContactFormHide}/>
              :null}
            </Col>
            {myLastSession?
              <Col md={addEditContactFormHide? '12': '9'}>
                  <QRXRadar 
                    centerContactSession={myLastSessionCenter}
                    bandPerimeter={bandPerimeter}
                    activeContactSessions={activeContactSessions}/> 
                  {activeContactSessions.length > 0?
                    <QRXTable 
                      center={myLastSessionCenter} 
                      activeAndZombieSessions={activeContactSessions}/>
                  :null}
              </Col>
            :null}
          </Row>
        ):(
          <Row className='main'>
            <Col md='12'>
              <center>
              <h1>{t('welcome')}!</h1>
              </center>
            </Col>
          </Row>
        )}
      </Container>
    </ContactContext.Provider>
  );
}

export default App;
