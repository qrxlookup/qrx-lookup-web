import { useTranslation } from "react-i18next";

// import { useState } from 'react';
import FirebaseAuthService from '../FirebaseAuthService';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebook, /* faTwitter, faApple */ } from "@fortawesome/free-brands-svg-icons";

import '../App.css';
// import { ContactContext, ContactInitialState } from '../App';

function LoginForm() {

    const { t } = useTranslation();

    // const { contact, setContact } = useContext(ContactContext);
    // const [username, setUsername] = useState('');
    // const [password, setPassword] = useState('');
    // const [registration, setRegistration] = useState(false);

    // const contactSessionLength = contact?.sessions?.length? contact.sessions.length: 0;
    // let contactSession = contactSessionLength > 0? contact.sessions[contactSessionLength - 1]: null;

    // async function handleLogin(event) {
    //     event.preventDefault();

    //     try {
    //         if (registration) {
    //             await FirebaseAuthService.registerUser(username, password);
    //         } else {
    //             await FirebaseAuthService.loginUser(username, password);
    //         }
    //         setUsername('');
    //         setPassword('');
    //         setRegistration(false);
    //     } catch (error) {
    //         alert(error.message);
    //     }
    // }

    // async function handleSendResetPasswordEmail() {
    //     if (!username) {
    //         alert("Missing username!");
    //         return;
    //     }

    //     try {
    //         await FirebaseAuthService.sendPasswordResetEmail(username);
    //         alert("Reset email sent to " + username);
    //     } catch (error) {
    //         alert(error.message);
    //     }
    // }

    function handleLoginWithGoogle() {
        try {
            FirebaseAuthService.loginWithGoogle();
        } catch (error) {
            alert(error.message);
        }
    }

    function handleLoginWithFacebook() {
        try {
            FirebaseAuthService.loginWithFacebook();
        } catch (error) {
            alert(error.message);
        }
    }

    // async function handleLoginWithApple() {
    // }

    // async function handleLoginWithTwitter() {
    // }

    // function handleLogout() {
    //     FirebaseAuthService.logoutUser();
    //     setContact(ContactInitialState);
    // }

    return (<>
            {/* <p><center>{t('Login')}</center></p> */}
            <p>{t('Login')}</p>
            <Form>
            {/* <Form.Group className="mb-2" controlId="email">
                <Form.Label>Email address</Form.Label>
                <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} type="email" placeholder="Enter email" />
                <Form.Text className="text-muted">
                    We'll never share your data.
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-2" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
            </Form.Group>
            <Form.Group className="mb-2" controlId="registration">
                <Form.Check checked={registration} onChange={(e) => setRegistration(e.target.checked)} type="checkbox" label="Registration" />
            </Form.Group> */}
            <div>
                {/* <Button variant="secondary" type="button" onClick={doNothing}>Reset</Button> */}
                {/* <Button variant="primary" type="button" onClick={handleLogin} style={{ marginLeft: '.5rem' }}>
                    {registration? "Sign-up": "Sign-in"}
                </Button> */}
                <Button variant="primary" type="button" onClick={handleLoginWithGoogle} style={{ marginLeft: '.5rem' }}>
                    <FontAwesomeIcon icon={faGoogle} size="1x" />
                </Button>
                <Button variant="primary" type="button" onClick={handleLoginWithFacebook} style={{ marginLeft: '.5rem' }}>
                    <FontAwesomeIcon icon={faFacebook} size="1x" />
                </Button>
                {/* <Button variant="secondary" disabled type="button" onClick={handleLoginWithTwitter} style={{ marginLeft: '.5rem' }} >
                    <FontAwesomeIcon icon={faTwitter} size="1x" />
                </Button>
                <Button variant="secondary" disabled type="button" onClick={handleLoginWithApple} style={{ marginLeft: '.5rem' }} >
                    <FontAwesomeIcon icon={faApple} size="1x" />
                </Button> */}
            </div>
        </Form>
    </>);
}

export default LoginForm;