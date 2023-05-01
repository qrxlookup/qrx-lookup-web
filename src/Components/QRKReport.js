import { AppContext } from '../App';
import QRXLookupConfig from '../QRXLookupConfig';
import { useState, useContext, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';

function QRKReport({ 
    contact,
    reports,
    reportId,
    reportRadio1, 
    reportRadio2,
    reportQRKRadio,
    reportQRKSignal,
    reportQSLRadio,
    reportQSLSignal,
    allSessions, 
    toggleShowQRKReport, 
    handleUpdateReport
}) {

    const { t } = useTranslation();
    const { language } = useContext(AppContext);
    const [ report, setReport ] = useState({
        id: reportId,
        selectedRadio1: reportRadio1,
        selectedRadio2: reportRadio2,
        qrkRadio: reportQRKRadio,
        qrkSignal: reportQRKSignal,
        qslRadio: reportQSLRadio,
        qslSignal: reportQSLSignal,
    });

    const myQRA = contact.operator;
    // const myLastSession = Object.assign(contact.sessions).pop();
    const myLastSession = contact.sessions.slice(-1);
    const myLastPosition = [myLastSession.latitude, myLastSession.longitude];

    let reportableSessions = allSessions;
    
    const handleResetRadioSelection = () => {

        console.log('handleResetRadioSelection');
        console.log('\n');

        setReport({
            selectedRadio1: null, 
            selectedRadio2: null,
            qrkRadio: 1,
            qrkSignal: 1,
            qslRadio: null,
            qslSignal: null,
        });
    }

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
        
        } else {
            handleResetRadioSelection();
        }
    }

    const handleSubmitQRKReport = () => {

        const updatedReport = {
            id: crypto.randomUUID(), 
            radio1Id: report.selectedRadio1.radioId,
            radio2Id: report.selectedRadio2.radioId,
            qrkRadio: report.qrkRadio,
            qrkSignal: report.qrkSignal,
        }

        // console.log(updatedReport);
        // console.log('\n');

        handleUpdateReport(updatedReport);

        toggleShowQRKReport();
    }

    const handleSubmitQSLReport = () => {

        const updatedReport = {
            id: report.id,
            radio1Id: report.selectedRadio1.radioId,
            radio2Id: report.selectedRadio2.radioId,
            qrkRadio: report.qrkRadio,
            qrkSignal: report.qrkSignal,
            qslRadio: report.qslRadio,
            qslSignal: report.qslSignal,
        }

        // console.log(updatedReport);
        // console.log('\n');

        handleUpdateReport(updatedReport);

        toggleShowQRKReport();
    }

    useEffect(() => {

        console.log(report);
        console.log('\n');

    }, [report]);

    allSessions.sort((s1, s2) => s2.checkOut - s1.checkOut);

    // let myRadiosMarkups = [];
    let otherRadiosMarkups = [];

    const options = {
        year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute:  "2-digit",
    };
      
    reportableSessions.forEach(session => {

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
        const localeCheckIn = checkIn.toLocaleString(QRXLookupConfig.locales[language], options);
        const localeCheckOut = checkOut.toLocaleString(QRXLookupConfig.locales[language], options);

        radios.forEach((radio) => {

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

            // console.log(`  Pending QRK: ${pendingQRK}`);
            // console.log(`  Pending QSL: ${pendingQSL}`);
            // console.log(`  Waiting QSL: ${waitingQSL}`);
            // console.log(`Completed QSO: ${completedQSO}`);
            // console.log('\n');

            const actionableRadio = report?.selectedRadio2?.radioId === radio.radioId && 
                                    (pendingQRK || pendingQSL);
    
            let [ channel ] = radio.frequency.replace(/\s/g, "").split("|");

            if (!contact.callsigns.includes(radio.callsign) || report.selectedRadio1) {
                otherRadiosMarkups.push(
                    <tr key={radio.radioId} onClick={() => actionableRadio? null :handleSelectRadio(session, radio)}>
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
                            <br />
                            <span style={{ fontFamily: 'monospace', fontSize: '80%' }}>
                                {`${localeCheckIn}`}<br />
                                {`${localeCheckOut} (${airTimeElapsedMinutes} ${t('minute')}s)`}
                            </span>

                            {report.selectedRadio2?.radioId === radio.radioId? (<>
                                <hr/>
                                {actionableRadio? (<>
                                    <table style={{width: '100%'}}><tbody><tr><td>
                                    <Form.Group className="mb-2" controlId="sortField">
                                        <Form.Label>{t('radio')}</Form.Label>
                                        <Form.Select
                                            value={pendingQSL? report.qslRadio: report.qrkRadio} 
                                            onChange={(e) => {pendingQSL?
                                                setReport({ ...report, qslRadio: e.target.value}):
                                                setReport({ ...report, qrkRadio: e.target.value})
                                            }}>
                                            <option key='1' value='1'>{t('reportRadio.R1')}</option>
                                            <option key='2' value='2'>{t('reportRadio.R2')}</option>
                                            <option key='3' value='3'>{t('reportRadio.R3')}</option>
                                            <option key='4' value='4'>{t('reportRadio.R4')}</option>
                                            <option key='5' value='5'>{t('reportRadio.R5')}</option>
                                        </Form.Select>
                                    </Form.Group>
                                    </td><td>
                                    <Form.Group className="mb-2" controlId="sortField">
                                        <Form.Label>{t('signal')}</Form.Label>
                                        <Form.Select 
                                            value={pendingQSL? report.qslSignal: report.qrkSignal} 
                                            onChange={(e) => {pendingQSL?
                                                setReport({ ...report, qslSignal: e.target.value}):
                                                setReport({ ...report, qrkSignal: e.target.value})
                                            }}>
                                            <option key='1' value='1'>S1</option>
                                            <option key='2' value='2'>S2</option>
                                            <option key='3' value='3'>S3</option>
                                            <option key='4' value='4'>S4</option>
                                            <option key='5' value='5'>S5</option>
                                            <option key='6' value='6'>S6</option>
                                            <option key='7' value='7'>S7</option>
                                            <option key='9' value='9'>S9+</option>
                                        </Form.Select>
                                    </Form.Group>
                                    </td></tr></tbody></table>
                                    <Button variant="primary" type="button" style={{ float: 'right', marginLeft: '.5rem' }}
                                        onClick={() => {pendingQSL? handleSubmitQSLReport(): handleSubmitQRKReport()}}>
                                        {pendingQSL? 'QSL': 'QRK'}
                                    </Button>
                                    <br/>
                                    <a href='/#' style={{ float: 'left' }} onClick={() => handleResetRadioSelection()}>
                                        {t('cancel')}
                                    </a>
                                </>):<i>                                
                                    {completedQSO || waitingQSL? t('qrkTable.alreadyReported'): t('qrxTable.notReportable')}!
                                </i>}
                            </>): null}
                        </td>
                    </tr>                     
                );
            }
        });
    })

    // console.log('about to render QRXReport...');
    // console.log('\n');

    return (<Form>
        <Table responsive striped bordered hover>
            <tbody>
                {otherRadiosMarkups}
            </tbody>
        </Table>
    </Form>);
}

export default QRKReport;