import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';

const Petition = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [petition, setPetition] = React.useState<Petition>({petitionId: 0, title: "", description: "", creationDate: new Date(), image_filename: "", ownerFirstName: "", ownerLastName: "", categoryId: 0})
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [title, setTitle] = React.useState("")

    React.useEffect(() => {
        const getPetition = () => {
            axios.get('http://localhost:4941/api/v1/petitions/' + id)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setPetition(response.data)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getPetition()
    }, [id])

    const updateTitleState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }

    const deletePetition = (petition: Petition) => {
        axios.delete('http://localhost:4941/ap1/v1/petitions/' + petition.petitionId)
            .then((response) => {
                navigate('/petitions')
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const updatePetition = (event: React.FormEvent<HTMLFormElement>, petition: Petition) => {
        event.preventDefault();
        if (title === "") {
            alert("Please enter a valid petition title!")
        } else {
            axios.put('http://localhost:4941/api/v1/petitions/' + petition.petitionId, { title })
                .then((reponse) => {
                    navigate('/petitions')
                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString())
                });
        }
    };

    if (errorFlag) {
        return (
            <div>
                <h1>Petition</h1>
                <div style={{ color:"red" }}>
                    {errorMessage}
                </div>
                <Link to={"/petitions"}> Back to Petitions</Link>
            </div>
        )
    } else {
        return (
            <div>
                <h1> Petition </h1>
                <h6> {petition?.petitionId}: {petition?.title}</h6>
                <Link to={'/petitions'}> Back to Petitions </Link>
                <h1>   </h1>
                <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#updatePetitionModal">
                    Edit
                </button>
                    <div className='modal fade' id='updatePetitionModal' tabIndex={-1} role="dialog"
                        aria-labelledby="updatePetitionModalLabel" aria-hiddden="true">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className='modal-title' id='updatePetitionModalLabel'>Update Petition</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className='modal-footer'>
                                        <form onSubmit={(e) => updatePetition(e, petition)}>
                                            <input type="text" value={title} onChange={updateTitleState} />
                                            <input type="submit" value="Submit" />
                                        </form>
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
            </div>
        )
    }

}

export default Petition;