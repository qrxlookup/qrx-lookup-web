import { useEffect, useState, /* useContext */ } from "react";
// import { useTranslation } from "react-i18next";
// import QRXLookupConfig from '../QRXLookupConfig';

const SECOND = 1000;
const MINUTE = SECOND * 60;
// eslint-disable-next-line no-unused-vars
const HOUR = MINUTE * 60;
// eslint-disable-next-line no-unused-vars
const DAY = HOUR * 24;

const QRXAirTime = ({ countDownDate, IID_KEY, SRV_KEY }) => {

    // const { t } = useTranslation();

    // let hour = 0; 
    let min = 0; 
    let sec = 0;

    if (!countDownDate)
        countDownDate = new Date();

    const [time, setTime] = useState(countDownDate.getTime() - new Date().getTime());
    // const [timer, setTimer] = useState(null);
    // const [notifier, setNotifier] = useState(null);

    useEffect(() => {
        
        const interval = setInterval(() => {             
            setTime(countDownDate.getTime() - new Date().getTime());
            if (countDownDate <= new Date()) clearInterval(interval);
        }, 1000);

        // if (countDownDate > new Date()) {

        //     const criticalAirTime = QRXLookupConfig.criticalAirTime;
        //     const warningTtl = `${t('atention')}!`;
        //     const warningMsg = `${t('airTime.expiring')} ${QRXLookupConfig.criticalAirTime} ${t('minute')}s!`;
        //     const delay = (countDownDate.getTime() - new Date().getTime()) - (criticalAirTime * 60 * 1000);

        //     console.log('Creating worker...');
        //     console.log('\n');

        //     let msgPusher = new Worker('/messagePusher.js');        

        //     msgPusher.onmessage = (e) => {
            
        //         const {notified} = e.data;

        //         console.log(`Message from worker: notified ${notified}.`);

        //         if (notified) msgPusher.terminate();
        //     };
            
        //     msgPusher.postMessage([
        //         warningTtl,
        //         warningMsg,
        //         IID_KEY,
        //         SRV_KEY,
        //         delay,
        //     ]);
        // }

        return () => clearInterval(interval);

    // eslint-disable-next-line
    }, [countDownDate]);

    if (time > 0) {
        sec = Math.floor((time / SECOND) % 60);
        min = Math.floor(time / MINUTE);
        // min = Math.floor((time / MINUTE) % 60);        
        // hour = Math.floor((time / HOUR) % 24);
    }

    // return `${hour}`.padStart(2, "0") + ':' +`${min}`.padStart(2, "0") + ':' +`${sec}`.padStart(2, "0");
    return `${min}`.padStart(2, "0") + ':' +`${sec}`.padStart(2, "0");
}

export default QRXAirTime;