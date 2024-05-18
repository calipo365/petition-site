import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { deepOrange } from '@mui/material/colors';

const Manage = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [petition, setPetition] = React.useState<Petition>({petitionId: 0, title: "", description: "", creationDate: new Date(), image_filename: "",ownerId: 0, ownerFirstName: "", numberOfSupporters: 0, moneyRaised: 0, ownerLastName: "", categoryId: 0, supportingCost: 0, supportTiers: []})
    const [supporters, setSupporters] = React.useState<Supporter[]>([]);
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
            <div key={item.supportTierId} className='tiers-details'>
                <h5>{item.title}</h5>
                    <p>{item.description}</p>
                    <p>{item.cost}</p>
            </div>
        ));
    };

    const list_of_supporters = () => {
        return supporters.map((item: Supporter) => {
            const tier = petition.supportTiers.find(tier => tier.supportTierId === item.supportTierId);
            const tierTitle = tier ? tier.title : 'Tier not found';
            return(
                <div key={item.supportId}>
                    <p>{tierTitle}</p>
                    <p>{item.message}</p>
                    <p>{new Date(item.timestamp).toLocaleDateString()}</p>
                    {userImageFailed ? (
                            <Avatar sx={{ bgcolor: deepOrange[500]}} className='supporter-img'>
                                {petition.ownerFirstName[0]}{petition.ownerLastName[0]}
                            </Avatar>
                        ) : (
                            <img 
                                src={`http://localhost:4941/api/v1/users/${item.supporterId}/image`}
                                alt={petition.ownerFirstName} className='supporter-img'
                            />
                        )}
                </div>
            )
        })
    }

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
    }

    const handleUserImageError = () => {
        setUserImageFailed(true);
    }

    const getUserInitials = () => {
        return `${petition.ownerFirstName[0]}${petition.ownerLastName[0]}`;
    };

    if (errorFlag) {
        return (
            <div>
                <h1>Manage your petition</h1>
                <div style={{ color:"red" }}>
                    {errorMessage}
                </div>
                <Link to={"/profile"}> Back to Profile</Link>
            </div>
        )
    } else {
        return (
            <div>
                <h1 className='title'> {petition.title} </h1>
                <body>
                    <img 
                        src={`http://localhost:4941/api/v1/petitions/${petition.ownerId}/image`}
                        alt={petition.title} className='petition-img'
                    />
                    <h6 className='owner-name'>{petition.ownerFirstName} {petition.ownerLastName}</h6>
                    {userImageFailed ? (
                        <Avatar sx={{ bgcolor: deepOrange[500]}} className='owner-img'>
                            {petition.ownerFirstName[0]}{petition.ownerLastName[0]}
                        </Avatar>
                    ) : (
                        <img 
                            src={`http://localhost:4941/api/v1/users/${petition.ownerId}/image`}
                            alt={petition.ownerFirstName} className='owner-img'
                        />
                    )}
                    <h6>Created on: {new Date(petition.creationDate).toLocaleDateString()}</h6>
                    {petition.description}
                    <body>Number of supporters: {petition.numberOfSupporters}</body>
                    <body>Money raised: {petition.moneyRaised}</body>
                    <body>Support tiers:</body>
                    <body>
                        {list_of_support_tiers()}
                        {list_of_supporters()}
                    </body>
                </body>
                <Link to={'/'}> Back to Petitions </Link>
            </div>
        )
    }
}

export default Manage;