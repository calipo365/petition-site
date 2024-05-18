import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import './Petition.css';
import Avatar from '@mui/material/Avatar';
import { deepOrange } from '@mui/material/colors';

const Petition = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [petition, setPetition] = React.useState<Petition>({petitionId: 0, title: "", description: "", creationDate: new Date(), image_filename: "",ownerId: 0, ownerFirstName: "", numberOfSupporters: 0, moneyRaised: 0, ownerLastName: "", categoryId: 0, supportingCost: 0, supportTiers: []})
    const [supporters, setSupporters] = React.useState<Supporter[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [userImageFailed, setUserImageFailed] = React.useState(false);
    const [title, setTitle] = React.useState("")

    React.useEffect(() => {
        getPetition()
        getSupporters()
    }, [id])

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

    const getSupporters = () => {
        axios.get('http://localhost:4941/api/v1/petitions/' + id + '/supporters')
        .then((response) => {
            setErrorFlag(false)
            setErrorMessage("")
            setSupporters(response.data)
        }, (error) => {
            setErrorFlag(true)
            setErrorMessage(error.toString())
        })
    }

    const list_of_support_tiers = () => {
        return petition.supportTiers.map((item: SupportTier) => (
            <div>
                <div key={item.supportTierId} className='support-tier'>
                    <p><strong>Title:</strong>{item.title}</p>
                    <p><strong>Description:</strong>{item.description}</p>
                    <p><strong>Cost:</strong>${item.cost}</p>
                </div>
                <button className="support-button">Support</button>
            </div>
        ));
    };

    const list_of_supporters = () => {
        return supporters.map((item: Supporter) => {
            const tier = petition.supportTiers.find(tier => tier.supportTierId === item.supportTierId);
            const tierTitle = tier ? tier.title : 'Tier not found';
            return(
                <div key={item.supportId} className='support-tier'>
                    <p>{item.supporterFirstName} {item.supporterLastName}</p>
                    <p>{tierTitle}</p>
                    <p>{item.message}</p>
                    <p>{new Date(item.timestamp).toLocaleDateString()}</p>
                    {userImageFailed ? (
                            <Avatar sx={{ bgcolor: deepOrange[500]}} className='owner-img'>
                                {item.supporterFirstName[0]}{item.supporterLastName}
                            </Avatar>
                        ) : (
                            <img 
                                src={`http://localhost:4941/api/v1/users/${item.supporterId}/image`}
                                alt={petition.ownerFirstName} className='owner-img'
                            />
                        )}
                </div>
            )
        })
    }

    if (errorFlag) {
        return (
            <div>
                <h1>Petition</h1>
                <div style={{ color:"red" }}>
                    {errorMessage}
                </div>
                <Link to={"/"}> Back to Petitions</Link>
            </div>
        )
    } else {
        return (
            <body>
                <header className="header">
                    <div className="logo" onClick={() => navigate(`/`)}>Petition Pledge</div>
                    <nav className="nav-links">
                        <a href="/users/register">Register</a>
                        <a href="/users/login">Login</a>
                        <a href="/users/logout">Logout</a>
                    </nav>
                </header>
            <div className="petition-container">
                <h1 className='title'> {petition.title} </h1>
                <body>
                    <img 
                        src={`http://localhost:4941/api/v1/petitions/${petition.ownerId}/image`}
                        alt="Petition Image" className='petition-image'
                    />
                    <p><strong>Created on: </strong>{new Date(petition.creationDate).toLocaleDateString()}</p>
                    <div className="petition-details">
                        <p><strong>Owner:  </strong> 
                        {petition.ownerFirstName} {petition.ownerLastName}{"     "}
                            {userImageFailed ? (
                            <Avatar sx={{ bgcolor: deepOrange[500]}} className='owner-img'>
                                {petition.ownerFirstName[0]}{petition.ownerLastName[0]}
                            </Avatar>
                        ) : (
                            <img 
                                src={`http://localhost:4941/api/v1/users/${petition.ownerId}/image`}
                                alt={petition.ownerFirstName} className='owner-img'
                            />
                        )}</p>
                        <p><strong>Description:</strong> {petition.description}</p>
                        </div>
                    </body>
                <div className='support-container'>
                        <h2>Support Us!</h2>
                        <p><strong>Number of supporters: </strong>{petition.numberOfSupporters}</p>
                        <p><strong>Money raised: </strong>${petition.moneyRaised}</p>
                        {list_of_support_tiers()}
                    </div>
                <div className='support-container'>
                        <h2>Our Supporters! </h2>
                        {list_of_supporters()}
                    </div>
            </div>
        </body>
        )
    }

}

export default Petition;