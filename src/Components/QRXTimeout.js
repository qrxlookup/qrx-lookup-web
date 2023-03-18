import { useEffect, useState, useContext } from "react";

import { ContactContext } from '../App';

import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
// eslint-disable-next-line no-unused-vars  
const DAY = HOUR * 24;

const QRXTimeout = ({ countDownDate }) => {

    const { contact, addEditContactFormHide, setAddEditContactFormHide } = useContext(ContactContext);

    async function handleToggleShowHideForm() {
        setAddEditContactFormHide(!addEditContactFormHide);
    }    

    const [time, setTime] = useState(countDownDate.getTime() - new Date().getTime());

    useEffect(        
        () => {
            const interval = setInterval(
                () => setTime(countDownDate.getTime() - new Date().getTime()),
                1000,
            );
            return () => clearInterval(interval);
        }, 
        [contact, countDownDate]
    );

    let countDown = <i>Run out of AirTime!!!</i>;

    if (time > 0) {

        countDown  = '';
        //countDown += `${Math.floor(time / DAY)}`.padStart(2, "0") + " days | ";
        countDown += `${Math.floor((time / HOUR) % 24)}`.padStart(2, "0") + " hours | ";
        countDown += `${Math.floor((time / MINUTE) % 60)}`.padStart(2, "0") + " mins | ";
        countDown += `${Math.floor((time / SECOND) % 60)}`.padStart(2, "0") + " secs";
    }

    return (
        <p>
            {countDown}
            <Button variant={addEditContactFormHide? 'primary': 'secondary'} type="button" onClick={handleToggleShowHideForm} style={{ marginLeft: '.5rem' }}>
                <FontAwesomeIcon icon={faPen} size="1x"/>
            </Button>
        </p>
    );
}

export default QRXTimeout;