// import { useTranslation } from "react-i18next";
// import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
// import Button from 'react-bootstrap/Button';

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faUserGroup } from "@fortawesome/free-solid-svg-icons";

function QRXTable({ contact, activeContactSessions, changeRadarCenter }) {

    // const { t } = useTranslation();

    const sortField = contact.sort.field.toLowerCase();
    const sortDescending = contact.sort.descending;

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
            sessionId, status, operator,
            latitude, longitude, distance, bearing, countryCode, country, city, locality,
            radios
        } = { ...session };

        let ghostSessionStyle = null;
        if (status === 'inactive') {
            ghostSessionStyle = {color: '#808080', fontStyle: 'normal'};
        }

        let k = 0;
        radios.forEach((r) => {            
            if (!contact.callsigns.includes(r.callsign)) {
                let [ channel ] = r.frequency.replace(/\s/g, "").split("|");
                radiosMarkups.push(
                    <tr key={`${sessionId}-${k}`} onClick={() => changeRadarCenter([latitude, longitude])}>
                        <td>                            
                            <span style={{ fontSize: '80%' }}>
                                {`${r.band} | ${channel}`} {r.tone? ` | ${r.tone} `: ''}
                            </span>
                            <span style={{ ...ghostSessionStyle, fontSize: '90%' }}>                                    
                                <b>{r.callsign} {operator? `(${operator})`: null}</b>
                            </span>
                            <br />
                            <span style={{ fontSize: '80%' }}>
                                {`${distance}km / ${bearing}° `}
                            </span>
                            <span style={{ fontSize: '80%' }}>
                                {`${locality}, ${city}, ${countryCode || country}`}
                            </span>
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