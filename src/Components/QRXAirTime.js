import { useEffect, useState, /* useContext */ } from "react";

// import { ContactContext } from '../App';

// import Button from 'react-bootstrap/Button';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPen } from "@fortawesome/free-solid-svg-icons";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
// eslint-disable-next-line no-unused-vars  
const DAY = HOUR * 24;

const QRXAirTime = ({ countDownDate }) => {

    let hour = 0; 
    let min = 0; 
    let sec = 0;

    if (!countDownDate)
        countDownDate = new Date();

    const [time, setTime] = useState(countDownDate.getTime() - new Date().getTime());

    useEffect(() => {

        const interval = setInterval(() => { 
            setTime(countDownDate.getTime() - new Date().getTime());
        }, 1000);

        return () => clearInterval(interval);

    }, [countDownDate]);

    if (time > 0) {
        // countDown  = '';
        // countDown += `${Math.floor(time / DAY)}`.padStart(2, "0") + " days | ";
        // countDown += `${Math.floor((time / HOUR) % 24)}`.padStart(2, "0") + ":";
        hour = Math.floor((time / HOUR) % 24);
        // countDown += `${Math.floor((time / MINUTE) % 60)}`.padStart(2, "0") + ":";
        min = Math.floor((time / MINUTE) % 60);
        // countDown += `${Math.floor((time / SECOND) % 60)}`.padStart(2, "0");
        sec = Math.floor((time / SECOND) % 60);
    }

    return `${hour}`.padStart(2, "0") + ':' +`${min}`.padStart(2, "0") + ':' +`${sec}`.padStart(2, "0");
}

export default QRXAirTime;