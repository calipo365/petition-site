import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';

const Petitions = () => {
    const navigate = useNavigate();
    const [petitions, setPetitions] = React.useState < Array < Conversation >> ([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState(" ")

    React.useEffect(() => {
        getPetitions()
    }, [])

    const getPetitions = () => {
        axios.get('http://localhost:3000/api/conversations')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage(" ")
                setConversations(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            }
        )
    }
}