import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';

const Petitions = () => {
    const navigate = useNavigate();
    const [petitions, setPetitions] = React.useState([]);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState(" ")

    React.useEffect(() => {
        getPetitions()
    }, [])

    const getPetitions = () => {
        axios.get('http://localhost:4941/api/v1/petitions')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage(" ")
                setPetitions(response.data.petitions)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            }
        )
    }

    const list_of_petitions = () => {
        return petitions.map((item: Petition) =>
            <div key={item.petitionId} className="petition">
                <img src={`http://localhost:4941/api/v1/petitions/${item.petitionId}/image`} alt={item.title} onClick={() => navigate(`/petitions/${item.petitionId}`)} />
                <div className="petition-details">
                    <h4>{item.title}</h4>
                    <p>Date: {new Date(item.creationDate).toLocaleDateString()}</p>
                    <p>Category ID: {item.categoryId}</p>
                    <p>Owner: {item.ownerFirstName} {item.ownerLastName}</p>
                </div>
            </div>
        )
    };


    return (
        <div>
            <h1>Petitions</h1>
            {list_of_petitions()}
        </div>

    )
}

export default Petitions;
