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

    // const { addEditContactFormHide, setAddEditContactFormHide } = useContext(ContactContext);
    const [time, setTime] = useState(countDownDate.getTime() - new Date().getTime());

    useEffect(() => {

        const interval = setInterval(() => { 
            setTime(countDownDate.getTime() - new Date().getTime());
            // console.log('tic-tac...');
        }, 1000);

        return () => clearInterval(interval);

    }, [countDownDate]);

    let countDown = '00h | 00m | 00s';

    if (time > 0) {
        countDown  = '';
        //countDown += `${Math.floor(time / DAY)}`.padStart(2, "0") + " days | ";
        countDown += `${Math.floor((time / HOUR) % 24)}`.padStart(2, "0") + "h | ";
        countDown += `${Math.floor((time / MINUTE) % 60)}`.padStart(2, "0") + "m | ";
        countDown += `${Math.floor((time / SECOND) % 60)}`.padStart(2, "0") + "s";
    }

    return countDown;
}

export default QRXAirTime;