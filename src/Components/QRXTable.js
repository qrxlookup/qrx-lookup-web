import { AppContext } from '../App';
import QRXLookupConfig from '../QRXLookupConfig';
import { useState, useContext, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

function QRXTable({ contact, reports, activeContactSessions, initializeReport, changeRadarCenter, toggleShowQRKReport }) {

    const { t } = useTranslation();

    const { language } = useContext(AppContext);

    const [ report, setReport ] = useState({
        selectedRadio1: null,
        selectedRadio2: null,
        qrkRadio: null,
        qrkSignal: null,
        qslRadio: null,
        qslSignal: null,        
    });

    const myQRA = contact.operator;
    const myLastSession = contact.sessions.slice(-1);
    const myLastPosition = [myLastSession.latitude, myLastSession.longitude];

    const sortField = contact.sort.field.toLowerCase();
    const sortDescending = contact.sort.descending;

    const handleSelectRadio = (session2, radio2) => {

        console.log('handleSelectRadio...');
        console.log('\n');

        if (radio2.radioId !== report.selectedRadio2?.radioId) {

            let myRadio = QRXLookupConfig.findReportableRadioFromContact(contact, session2, radio2, myQRA, myLastPosition);
            let reported = null;

            if (myRadio) {

                reported = reports.find(elem => {
                    return (elem.radio1Id === myRadio.radioId && elem.radio2Id === radio2.radioId) ||
                           (elem.radio2Id === myRadio.radioId && elem.radio1Id === radio2.radioId);
                });
            }

            setReport({
                ...report,
                id: reported?.id,
                selectedRadio1: myRadio,
                selectedRadio2: radio2,
                qrkRadio: reported?.qrkRadio,
                qrkSignal: reported?.qrkSignal,
                qslRadio: reported?.qslRadio,
                qslSignal: reported?.qslSignal,
            });

            changeRadarCenter([
                session2.latitude, session2.longitude
            ]);

        } else {
            handleResetRadioSelection();
        }
    }

    const handleResetRadioSelection = () => {

        setReport({
            selectedRadio1: null, 
            selectedRadio2: null,
            qrkRadio: null,
            qrkSignal: null,
            qslRadio: null,
            qslSignal: null,            
        });

        changeRadarCenter(null);
    }

    const handleInitializeReport = () => {

        initializeReport({

            id: report?.id,
            selectedRadio1: { ...report.selectedRadio1 },
            selectedRadio2: { ...report.selectedRadio2 },
            qrkRadio: report?.qrkRadio,
            qrkSignal: report?.qrkSignal,
            qslRadio: report?.qslRadio,
            qslSignal: report?.qslSignal,
        });

        toggleShowQRKReport();
    }

    useEffect(() => {
    // eslint-disable-next-line
    }, [report.selectedRadio2]);

    switch (sortField) {

        case 'callsign':
        case 'operator':
        case 'status':
        case 'band':
        case 'frequency':
        case 'locality':
        case 'city':
        case 'country':
            sortDescending?
                activeContactSessions.sort((s1, s2) => -1 * s1[sortField].localeCompare(s2[sortField])):
                activeContactSessions.sort((s1, s2) => s1[sortField].localeCompare(s2[sortField]));
        break;
        case 'distance':
        case 'bearing':
            sortDescending?
                activeContactSessions.sort((s1, s2) => s2[sortField] - s1[sortField]):
                activeContactSessions.sort((s1, s2) => s1[sortField] - s2[sortField]);
        break;
        default:
        break;
    }

    let radiosMarkups = [];

    activeContactSessions.forEach(session => {

        const { 
            checkIn, checkOut, status, operator,
            distance, bearing, countryCode, country, city, locality,
            radios
        } = { ...session };

        let ghostSessionStyle = null;
        if (status === 'inactive') {
            ghostSessionStyle = {color: '#808080', fontStyle: 'normal'};
        }

        const airTimeElapsedMinutes = Math.floor((checkOut - checkIn) / 60000);

        const localeCheckIn = checkIn.toLocaleString(QRXLookupConfig.locales[language]);
        const localeCheckOut = checkOut.toLocaleString(QRXLookupConfig.locales[language]);

        let k = 0;
        radios.forEach((radio) => {

            if (!contact.callsigns.includes(radio.callsign)) {

                let pendingQRK = false;
                let pendingQSL = false;
                let waitingQSL = false;
                let completedQSO = false;
    
                const myRadio = QRXLookupConfig.findReportableRadioFromContact(contact, session, radio, myQRA, myLastPosition);
    
                if (myRadio) {

                    const reported = reports.find(elem => {
                        return (elem.radio1Id === radio.radioId && elem.radio2Id === myRadio.radioId) ||
                               (elem.radio2Id === radio.radioId && elem.radio1Id === myRadio.radioId);
                    });
    
                    if (!reported) {
                        pendingQRK = true;
                    }
    
                    if (reported && reported.radio2Id === myRadio.radioId) {
                        pendingQSL = reported?.qrkRadio && reported?.qrkSignal &&
                                     !reported?.qslRadio && !reported?.qslSignal;
                    }

                    if (reported && reported.radio1Id === myRadio.radioId) {
                        waitingQSL = reported?.qrkRadio && reported?.qrkSignal &&
                                     !reported?.qslRadio && !reported?.qslSignal;
                    }
    
                    if (reported) {
                        completedQSO = reported?.qrkRadio && reported?.qrkSignal &&
                                       reported?.qslRadio && reported?.qslSignal;
                    }
                }

                const actionableRadio = report?.selectedRadio2?.radioId === radio.radioId && 
                                        (pendingQRK || pendingQSL);

                const [ channel ] = radio.frequency.replace(/\s/g, "").split("|");

                radiosMarkups.push(
                    <tr key={radio.radioId} onClick={() => handleSelectRadio(session, radio)}>
                        <td>
                            <span style={{ fontSize: '80%' }}>

                                {pendingQRK? <><Badge bg="primary">QRK?</Badge>&nbsp;</>:null}
                                {pendingQSL? <><Badge bg="primary">QSL?</Badge>&nbsp;</>:null}
                                {completedQSO? <><Badge bg="primary">QSO</Badge>&nbsp;</>:null}

                                {`${radio.band} | ${channel}`} {radio.tone? ` | ${radio.tone} `: ''}
                            </span>
                            <span style={{ ...ghostSessionStyle, fontSize: '90%' }}>                                    
                                <b>{radio.callsign} {operator? `(${operator})`: null}</b>
                            </span>
                            <br />
                            <span style={{ fontFamily: 'monospace', fontSize: '80%' }}>
                                {`${distance}km / ${bearing}° `}
                            </span>
                            <span style={{ fontSize: '85%', fontStyle:'italic' }}>
                                {`${locality}, ${city}, ${countryCode || country}`}
                            </span>
                            {report.selectedRadio2?.radioId === radio.radioId? <>
                                <br />
                                <span style={{ fontFamily: 'monospace', fontSize: '80%' }}>
                                    {`${localeCheckIn}`}<br />
                                    {`${localeCheckOut} (${airTimeElapsedMinutes} ${t('minute')}s)`}
                                </span>
                                <hr/>
                                {actionableRadio? (
                                    <Button type="button" style={{ float: 'right', marginLeft: '.5rem' }}
                                        variant='primary'
                                        onClick={() => handleInitializeReport()}>
                                        {t('report')}...
                                    </Button>
                                ):(
                                    <i>
                                        {completedQSO || waitingQSL? t('qrkTable.alreadyReported'): t('qrxTable.notReportable')}!
                                    </i>
                                )}
                            </>:null}
                        </td>
                    </tr>
                );
            } k = k + 1;
        });
    })

    // console.log('about to render QRXTable...');
    // console.log('\n');

    return (
        <Table responsive striped bordered hover>
            <tbody>
                {radiosMarkups}
            </tbody>
        </Table>
    );
}

export default QRXTable;