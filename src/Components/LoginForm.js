import { useState, useContext } from 'react';
import FirebaseAuthService from '../FirebaseAuthService';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebook, faTwitter, faApple } from "@fortawesome/free-brands-svg-icons";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import '../App.css';
import { ContactContext } from '../App';

function LoginForm({ handleInitializeContact }) {

    const { contact } = useContext(ContactContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [registration, setRegistration] = useState(false);

    const contactSession = contact.sessions.length > 0? contact.sessions[contact.sessions.length - 1]: null;

    async function handleLogin(event) {
        event.preventDefault();

        try {
            if (registration) {
                await FirebaseAuthService.registerUser(username, password);
            } else {
                await FirebaseAuthService.loginUser(username, password);
            }
            setUsername('');
            setPassword('');
        } catch (error) {
            alert(error.message);
        }
    }

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

    async function handleLoginWithGoogle() {
        try {
            await FirebaseAuthService.loginWithGoogle();
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleLoginWithFacebook() {
        try {
            await FirebaseAuthService.loginWithFacebook();
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleLoginWithApple() {
    }

    async function handleLoginWithTwitter() {
    }

    function handleLogout() {
        FirebaseAuthService.logoutUser();
        handleInitializeContact();
    }

    async function doNothing() {
    }

    return <div>
        {
            contact.email? (
                <div>
                    {contactSession? (
                        <h4><code>{contactSession.callsign + " @ " + contactSession.maidenhead}</code></h4>
                    ): (null)}
                    <p>
                        {contact.email}
                        <Button variant="primary" type="button" onClick={handleLogout} style={{ marginLeft: '.5rem' }}>
                            <FontAwesomeIcon icon={faArrowRightFromBracket} size="1x"/>
                        </Button>
                    </p>
                </div>
            ) : (
                <Form>
                    <Form.Group className="mb-2" controlId="email">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} type="email" placeholder="Enter email" />
                        <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-2" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
                    </Form.Group>
                    <Form.Group className="mb-2" controlId="registration">
                        <Form.Check checked={registration} onChange={(e) => setRegistration(e.target.checked)} type="checkbox" label="Registration" />
                    </Form.Group>
                    <div>
                        <Button variant="secondary" type="button" onClick={doNothing}>Reset</Button>
                        <Button variant="primary" type="button" onClick={handleLogin} style={{ marginLeft: '.5rem' }}>
                            {registration? "Sign-up": "Sign-in"}
                        </Button>
                        <Button variant="primary" type="button" onClick={handleLoginWithGoogle} style={{ marginLeft: '.5rem' }}>
                            <FontAwesomeIcon icon={faGoogle} size="1x" />
                        </Button>
                        <Button variant="primary" type="button" onClick={handleLoginWithFacebook} style={{ marginLeft: '.5rem' }}>
                            <FontAwesomeIcon icon={faFacebook} size="1x" />
                        </Button>
                        <Button variant="secondary" disabled type="button" onClick={handleLoginWithTwitter} style={{ marginLeft: '.5rem' }} >
                            <FontAwesomeIcon icon={faTwitter} size="1x" />
                        </Button>
                        <Button variant="secondary" disabled type="button" onClick={handleLoginWithApple} style={{ marginLeft: '.5rem' }} >
                            <FontAwesomeIcon icon={faApple} size="1x" />
                        </Button>
                    </div>
                </Form>
            )
        }
    </div>
}

export default LoginForm;