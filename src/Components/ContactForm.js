import { useTranslation } from "react-i18next";

import { useState, useEffect } from 'react';
import QRXLookupConfig from '../QRXLookupConfig';

import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
  
// eslint-disable-next-line
function ContactForm({ contact, handleUpdateContact, validCallsign }) {

    const { t } = useTranslation();

    const sortFields = [
        'CallSign', 'Operator','Distance', 'Bearing', 'Status', 'Locality', 'City', 'Country'
    ];

    const [form, setForm] = useState({
        oper: contact?.operator || '',
        calls: contact?.callsigns?.length < 1? ['', ]: contact?.callsigns,
        perim: contact?.perimeter || '',
        sort: contact?.sort || {field: sortFields[0], descending: false},
    });

    const [ formErrors, setFormErrors ] = useState({});

    const setFormField = (field, value) => {

        if ( ['sort.field', 'sort.descending'].includes(field) ) {

            // eslint-disable-next-line
            const [ _, subField ] = field.split('.');

            const sort = {
                ...form.sort,
                [subField]: value,    
            };

            field = 'sort';
            value = { ...sort };
        }

        setForm({
            ...form,
            [field]: value
        });

        if ( !!formErrors[field] ) setFormErrors({
            ...formErrors,
            [field]: null
        });
    }

    const findFormErrors = () => {

        const newErrors = {};

        const { calls } = form;

        for (const idx in calls) {

            if ( !calls[idx] || calls[idx] === '' )
                newErrors[`call${idx}`] = 'mandatory';
            else if ( !validCallsign(calls[idx], QRXLookupConfig.similarityPct, contact.email) )
                newErrors[`call${idx}`] = 'contactForm.CallSign.similar';            
        }
        
        return newErrors
    }

    const setCallSignAtIndex = (value, idx) => {

        form.calls[idx] = value;

        setForm({
            ...form,
        });
    }
        
    const handleAddCallSign = () => {
        setForm({
            ...form,
            calls: [ ...form.calls, '' ],
        });
    }

    const handleRemoveCallSign = (idx) => {
        form.calls.splice(idx, 1);
        setForm({
            ...form,
        });
    }

    const handleSaveContact = async (e) => {
        e.preventDefault();

        const newErrors = findFormErrors();

        if ( Object.keys(newErrors).length > 0 ) {

            setFormErrors(newErrors);

        } else {

            let updatedContact = {
                ...contact,
                operator: form.oper,
                callsigns: form.calls,
                perimeter: form.perim? form.perim: '',
                sort: form.sort,
            };
            
            handleUpdateContact(updatedContact);
        }
    };
  
    useEffect(() => {
        setForm({
            ...form,
            oper: contact?.operator,
            calls: contact?.callsigns?.length < 1? ['', ]: contact?.callsigns,
            perim: contact?.perimeter,
            sort: contact?.sort || {field: sortFields[0], descending: false},
        });
    // eslint-disable-next-line
    }, [contact]);

    // console.log('about to render contactForm...');
    // console.log('\n');

    return (<>
        <i>{t('profile.about')}...</i>
        <h2>{contact.email}</h2>
        <br/>
        <Form noValidate onSubmit={(e) => handleSaveContact(e)}>

            {/* OPERATOR */}
            <Form.Group className="mb-2" controlId="operator">
                <Form.Label>{t('contactForm.Operator')}</Form.Label>
                <Form.Control value={form.oper} placeholder={t('optional')}
                    onChange={(e) => setFormField('oper', e.target.value)} type="text" />
            </Form.Group>

            {/* SORT */}
            <table>
                <tbody>
                    <tr>
                        <td>
            <Form.Group className="mb-2" controlId="sortField">
                <Form.Label>{t('profile.SortField')}</Form.Label>
                <Form.Select value={form.sort.field}
                    onChange={(e) => setFormField('sort.field', e.target.value)} isInvalid={ !!formErrors.sortField }>
                    {sortFields?.map((item, idx) => {
                        return (
                            <option key={idx} value={item}>{t(`contactForm.${item}`)}</option>
                        )
                    })}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{t(formErrors.call)}!</Form.Control.Feedback>
            </Form.Group>
                        </td>
                    </tr>
                    <tr>
                        <td>
            <Form.Group className="mb-2" controlId="sortDsc">
                <Form.Check label={t('descending')} checked={form.sort.descending} name="sortDsc" type='checkbox' 
                    onChange={(e) => setFormField('sort.descending', !form.sort.descending)} />
            </Form.Group>                            
                        </td>
                    </tr>
                </tbody>
            </table>
            
            {/* CALLSIGNS */}
            <Form.Group className="mb-2" controlId="callsign">
                <Table>
                    <thead>
                        <tr>
                            <td>{t('contactForm.CallSign')}</td>
                            <td><a href='/#' onClick={() => handleAddCallSign()}>{t('add')}</a></td>
                        </tr>
                    </thead>
                    <tbody>
                        {form.calls?.map((call, idx) => {
                            return (
                                <tr key={idx}>
                                    <td>
                                        <Form.Control value={call} type="text" placeholder={t('mandatory')}
                                            onChange={(e) => setCallSignAtIndex(e.target.value, idx)}
                                            isInvalid={ !!formErrors[`call${idx}`] }/>
                                        <Form.Control.Feedback type="invalid">
                                            {t(formErrors[`call${idx}`])}!
                                        </Form.Control.Feedback>
                                    </td>
                                    <td>
                                        <a href='/#' onClick={() => handleRemoveCallSign(idx)}>{t('remove')}</a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Form.Group>

            {/* PERIMETER */}
            <Form.Group className="mb-2" controlId="perimeter">
                <Form.Label>{t('contactForm.ReachabilityPerimeter')}</Form.Label><br/>
                <Form.Check inline label={t('contactForm.ReachabilityPerimeter.None')} value='' 
                    checked={!form.perim || form.perim === ''} 
                    onChange={(e) => setFormField('perim', e.target.value)} 
                    name="perimeter" type='radio' id='none'/>
                <Form.Check inline label={t('contactForm.ReachabilityPerimeter.Urban')} value='urban' 
                    checked={form.perim === 'urban'} 
                    onChange={(e) => setFormField('perim', e.target.value)} 
                    name="perimeter" type='radio' id='urban'/>
                <Form.Check inline label={t('contactForm.ReachabilityPerimeter.Rural')} value='rural' 
                    checked={form.perim === 'rural'} 
                    onChange={(e) => setFormField('perim', e.target.value)}
                    name="perimeter" type='radio' id='rural'/>
            </Form.Group>

            <Button type="submit" style={{ marginLeft: '.3rem', marginBottom: '.5rem' }}>
                <FontAwesomeIcon icon={faFloppyDisk} size="1x"/>
            </Button>
        </Form>
    </>);
}

export default ContactForm;