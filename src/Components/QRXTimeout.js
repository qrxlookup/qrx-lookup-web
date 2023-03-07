import { useEffect, useState, useContext } from "react";

import { ContactContext } from '../App';
import QRXLookupConfig from "../QRXLookupConfig";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const QRXTimeout = ({ countDownDate }) => {

    const { contact } = useContext(ContactContext);

    const [time, setTime] = useState(countDownDate.getTime() - new Date().getTime());

    useEffect(        
        () => {
            const interval = setInterval(
                () => setTime(countDownDate.getTime() - new Date().getTime()),
                1000,
            );
            return () => clearInterval(interval);
        }, 
        [contact]
    );

    let countDown = <i>Run out of AirTime!!!</i>;
    let fontColor = '#ff0000';

    if (time > 0) {

        countDown  = '';
        //countDown += `${Math.floor(time / DAY)}`.padStart(2, "0") + " days | ";
        countDown += `${Math.floor((time / HOUR) % 24)}`.padStart(2, "0") + " hours | ";
        countDown += `${Math.floor((time / MINUTE) % 60)}`.padStart(2, "0") + " mins | ";
        countDown += `${Math.floor((time / SECOND) % 60)}`.padStart(2, "0") + " secs";

        fontColor = '#fff';
    }

    return (
        <div style={{ color: fontColor }}>{countDown}</div>
    );
}

export default QRXTimeout;