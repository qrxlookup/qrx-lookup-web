import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import React, { useState, createContext, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FirebaseAuthService from './FirebaseAuthService';
import QRXLookupConfig from './QRXLookupConfig';
import LoginForm from './Components/LoginForm';
import AddEditContactForm from './Components/AddEditContactForm';
import QRXRadar from './Components/QRXRadar';
import QRXTimeout from './Components/QRXTimeout';
import FirebaseFirestoreService from './FirebaseFirestoreService';

import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export const ContactContext = createContext();

export const ContactInitialState = {
  email: '',
  sessions: [],
};

export const ContactSessionInitialState = {
  SessionId: '',
  callsign: '',
  band: '',
  frequency: 0.0,
  CTCSSFrequency: 0.0,
  latitude: 0.0,
  longitude: 0.0,
  maidenhead: '',
  checkIn: null,
  checkOut: null,
};

const fetchContacts = async() => {
  let fetchedContacts = [];
  try {
    const response = await FirebaseFirestoreService.readDocuments('contacts');

    const newContacts = response.docs.map((contactDoc) => {
      // const id = contactDoc.id;
      const data = contactDoc.data();

      let sessions = [];
      for (const session of contactDoc.data().sessions) {
        session.checkIn = new Date(session.checkIn.toDate());
        session.checkOut = new Date(session.checkOut.toDate());
        sessions.push({ ...session });
      }

      return { 
        ...data, 
        sessions: [ ...sessions ],
      };
    });

    fetchedContacts = [...newContacts];
  } catch (error) {
    console.error(error.message);
    throw error;
  }

  return fetchedContacts;
}

function App() {

  const [ user, setUser ] = useState(null);
  const [ contacts, setContacts ] = useState([]);
  const [ contact, setContact ] = useState(ContactInitialState);
  const [ addEditContactFormHide, setAddEditContactFormHide ] = useState(false);

  const bands = QRXLookupConfig.bands;
  const bandFrequencies = QRXLookupConfig.bandFrequencies;
  const CTCSSFrequencies = QRXLookupConfig.CTCSSFrequencies;

  async function handleFetchContacts() {
    try {

      const fetchedContacts = await fetchContacts();
      setContacts(fetchedContacts);
    } catch (error) {
      console.error(error.message);
      throw error;      
    }
  }

  function handleGetActiveSessions() {

    let active = [];
    
    for (let c of contacts) {
        for (let s of c.sessions) {
            if (s.checkOut > new Date()) {
                active = [ ...active, { ...s } ];
            }
        }
    }
    
    return active;
  }

  function handleUpdateContactByEmail(email) {
    let found = false;
    for (let c of contacts) {
      found = (c.email === email);
      if (found) {
        console.log(`Found contact for ${user.email}...`);
        console.log(c);
        setContact({ ...c });
      }
    }

    if (!found) {
      setContact({
        ...contact,
        email: email,
      });
    }
  }

  async function handleUpdateContact(updatedContact) {

    try {
        const response = await FirebaseFirestoreService.updateDocument('contacts', updatedContact);

        handleFetchContacts();

        //alert(`Successefully created document with ID ${response.id}`);
        console.log(response);

        setContact({
            ...updatedContact,
        });

    } catch (error) {
        alert(error.message);
    }
  }

  function handleLogout() {
    FirebaseAuthService.logoutUser();
    setContact(ContactInitialState);
  }

  useEffect(() => {

    FirebaseAuthService.subscribeToAuthChanges(setUser);

    fetchContacts().then((fetchedContacts) => {
      setContacts(fetchedContacts);
    }).catch((error) => {
      console.error(error.message);
      throw error;
    });

    if (user?.email) {
      console.log(`Searching contact for ${user.email}...`);
      handleUpdateContactByEmail(user.email);
    }
  // eslint-disable-next-line  
  }, [user]);

  // useLayoutEffect(() => {

  //   FirebaseAuthService.subscribeToAuthChanges(setUser);

  //   console.log(user);

  //   if (user) {

  //     fetchContacts().then((fetchedContacts) => {
  //       setContacts([ ...fetchedContacts ]);
  //     }).catch((error) => {
  //       console.error(error.message);
  //       throw error;
  //     });

  //     console.log(contacts);

  //     handleUpdateContactByEmail(user?.email);
  //   }
    
  // }, [user]);

  const sessionsLength = contact?.sessions?.length? contact.sessions.length: 0;
  const lastContactSession = sessionsLength > 0? 
    contact.sessions[sessionsLength - 1]:
    { ...ContactSessionInitialState };

  const band = lastContactSession? bands.find(elem => elem.value === lastContactSession.band): null;
  const freq = lastContactSession? bandFrequencies.find(elem => elem.value === lastContactSession.frequency): null;
  const tone = lastContactSession? CTCSSFrequencies.find(elem => elem.value === lastContactSession.CTCSSFrequency): null;

  const centerContactSession = [lastContactSession.latitude, lastContactSession.longitude];
  const activeContactSessions = [ ...handleGetActiveSessions() ];

  console.log('Active sessions...');
  console.log(activeContactSessions);

  // console.log(user);
  // console.log(contacts);
  // console.log(contact);
  // console.log(lastContactSession)
  // console.log('about to render App...');

  return (
    <ContactContext.Provider value={{ contact, setContact, addEditContactFormHide, setAddEditContactFormHide }}>
      <Container className='App' fluid>
        <Row className='header'>
          <Col className='header-left' md>
            <p className="title">QRX Lookup</p>
            {lastContactSession?.checkOut? (
              <QRXTimeout countDownDate={lastContactSession.checkOut} />
            ) : (null)}
          </Col>
          <Col className='header-center' md>
            <h2 style={{ color: '#ffff00' }}>{freq ? freq.label : null}</h2>
            <i>{band ? band.label : null} {tone ? "| " + tone.label : null}</i>
          </Col>
          <Col className='header-right' md>
            {!user? <LoginForm />:
              <>
              {lastContactSession.callsign && lastContactSession.maidenhead?
                <h3><code>{lastContactSession.callsign + " @ " + lastContactSession.maidenhead}</code></h3>: null
              }
              <p>
                {user.email}
                <Button variant="primary" type="button" onClick={handleLogout} style={{ marginLeft: '.5rem' }}>
                  <FontAwesomeIcon icon={faArrowRightFromBracket} size="1x"/>
                </Button>
              </p>
              </>
            }
          </Col>
        </Row>
        <Row className='main'>
          <Col md='3'>
            {user && lastContactSession && !addEditContactFormHide?
              <AddEditContactForm handleUpdateContact={handleUpdateContact}/>: null}
          </Col>
          <Col md={addEditContactFormHide? '12': '9'}>
            {lastContactSession?.latitude !== 0.0 && lastContactSession?.longitude !== 0.0?
              <QRXRadar centerContactSession={centerContactSession} activeContactSessions={activeContactSessions}/>: null}
          </Col>
        </Row>
      </Container>
    </ContactContext.Provider>
  );
}

export default App;
