import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import './Petitions.css';

const Petitions = () => {
    const navigate = useNavigate();
    const [petitions, setPetitions] = React.useState([]);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState(" ")
    const [title, setTitle]= React.useState("")

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
                <img 
                    src={`http://localhost:4941/api/v1/petitions/${item.petitionId}/image`}
                    alt={item.title}
                    onClick={() => navigate(`/petitions/${item.petitionId}`)}
                />
                <div className="petition-details">
                    <h4>{item.title}</h4>
                    <p>Date: {new Date(item.creationDate).toLocaleDateString()}</p>
                    <p>Category ID: {item.categoryId}</p>
                    <p>Owner: {item.ownerFirstName} {item.ownerLastName}</p>
                </div>
            </div>
        )
    }

    const addPetition = () => {

    }

    const updateTitleState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };


    return (
        <div>
            <h2>Petition Pledge</h2>
            <div className="make-petition-container">
                <button type="button" className="make-button" data-toggle="modal" data-target="#makePetitionModal">
                        Make your own petition!
                    </button>
                        <div className='modal fade' id='makePetitionModal' tabIndex={-1} role="dialog"
                            aria-labelledby="makePetitionModalLabel" aria-hiddden="true">
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className='modal-title' id='makePetitionModalLabel'>Make a petition</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className='modal-footer'>
                                            <form onSubmit={addPetition}>
                                                <input type='text' value={title} onChange={updateTitleState} />
                                                <input type='submit' value='Submit' />
                                            </form>
                                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>
                                                Close
                                            </button>
                                </div>  
                                    </div>
                                </div>    
                            </div>
                        </div>
                <div className="petition-container">
                    <div className="petition-grid">{list_of_petitions()}</div>
                </div>
        </div>
    )
}

export default Petitions;
