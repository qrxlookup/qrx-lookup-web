import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import React, { useState, createContext, useEffect } from 'react';
import FirebaseAuthService from './FirebaseAuthService';
import QRXLookupConfig from './QRXLookupConfig';
import LoginForm from './Components/LoginForm';
import AddEditContactForm from './Components/AddEditContactForm';
import QRXRadar from './Components/QRXRadar';
import QRXTimeout from './Components/QRXTimeout';
import FirebaseFirestoreService from './FirebaseFirestoreService';

export const ContactContext = createContext();

export const ContactInitialState = {
  email: '',
  sessions: [],
};

export const ContactSessionInitialState = {
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

function App() {

  const [ user, setUser ] = useState(null);
  const [ contact, setContact ] = useState(ContactInitialState);
  // eslint-disable-next-line no-unused-vars
  const [ contacts, setContacts ] = useState([]);

  const currentContactSession = contact.sessions.length > 0? contact.sessions[contact.sessions.length - 1]: null;

  const bands = QRXLookupConfig.bands;
  const bandFrequencies = QRXLookupConfig.bandFrequencies;
  const CTCSSFrequencies = QRXLookupConfig.CTCSSFrequencies;

  function handleInitializeContact() {
    setContact({
      ...ContactInitialState,
    });
  }

  async function fetchContacts() {
    let fetchedContacts = [];
    try {
      const response = await FirebaseFirestoreService.readDocuments('contacts');

      const newContacts = response.docs.map((contactDoc) => {
        const id = contactDoc.id;
        const data = contactDoc.data;
        return { ...data, id };
      })

      fetchedContacts = [...newContacts];
    } catch (error) {
      console.error(error.message);
      throw error;
    }

    return fetchedContacts;
  }

  async function handleFetchContacts() {
    try {
      const fetchedContacts = await fetchContacts();

      setContacts(fetchedContacts);
    } catch (error) {
      console.error(error.message);
      throw error;      
    }
  }

  async function handleAddContact(newContact) {

    try {
        const response = await FirebaseFirestoreService.createDocument('contacts', newContact);

        handleFetchContacts();

        alert(`Successefully created document with ID ${response.id}`);

        setContact({
            ...newContact,
            id: response.id,
        });

    } catch (error) {
        alert(error.message);
    }
  }

  useEffect(() => {

    FirebaseAuthService.subscribeToAuthChanges(setUser);

    if (user && user.email !== contact.email) {
      setContact({
        ...contact,
        email: user.email,
      });
    }

    fetchContacts().then((fetchedContacts) => {
      setContacts(fetchedContacts);
    }).catch((error) => {
      console.error(error.message);
      throw error;
    })

  }, [contact, user]);

  const band = currentContactSession? bands.find(elem => elem.value === currentContactSession.band): null;
  const freq = currentContactSession? bandFrequencies.find(elem => elem.value === currentContactSession.frequency): null;
  const tone = currentContactSession? CTCSSFrequencies.find(elem => elem.value === currentContactSession.CTCSSFrequency): null;

  return (
    <ContactContext.Provider value={{ contact, setContact }}>
      <div className="App">
        <div className="header">
          <div className='header-left'>
            <p className="title">QRX Lookup</p>
            {currentContactSession? (
              <QRXTimeout countDownDate={currentContactSession.checkOut} />
            ) : (null)}
          </div>
          <div className='header-center'>
            <div>
              <h2 style={{ color: '#ffff00' }}>{freq ? freq.label : null}</h2>
              <i>{band ? band.label : null} {tone ? "| " + tone.label : null}</i>
            </div>
          </div>
          <div className='header-right'>
            <LoginForm handleInitializeContact={handleInitializeContact}></LoginForm>
          </div>
        </div>
        <div className='main'>
          {user? (          
            <AddEditContactForm handleAddContact={handleAddContact}/>
          ) : (null)}
          {currentContactSession? (
            <QRXRadar contactSession={currentContactSession} />
          ) : (null)}
        </div>
      </div>
    </ContactContext.Provider>
  );
}

export default App;
