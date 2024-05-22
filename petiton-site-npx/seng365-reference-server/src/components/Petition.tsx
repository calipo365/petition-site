import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import './Petition.css';
import './Petitions.css';
import Avatar from '@mui/material/Avatar';
import { pink } from '@mui/material/colors';
import { Button, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';



const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };


interface OwnerImageOrAvatarProps {
    ownerId: number;
    ownerFirstName: string;
    ownerLastName: string;
}

const OwnerImageOrAvatar: React.FC<OwnerImageOrAvatarProps> = ({ ownerId, ownerFirstName, ownerLastName }) => {
    const [imageFailed, setImageFailed] = React.useState(false);

    const handleImageError = () => {
        setImageFailed(true);
    };

    return (
        imageFailed ? (
            <Avatar sx={{ bgcolor: pink[500] }}>
                {ownerFirstName[0]}{ownerLastName[0]}
            </Avatar>
        ) : (
            <img
                src={`http://localhost:4941/api/v1/users/${ownerId}/image`}
                alt={`${ownerFirstName} ${ownerLastName}`}
                className='small-image'
                onError={handleImageError}
            />
        )
    );
};


const Petition = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [petition, setPetition] = React.useState<Petition>({petitionId: 0, title: "", description: "", creationDate: new Date(), image_filename: "",ownerId: 0, ownerFirstName: "", numberOfSupporters: 0, moneyRaised: 0, ownerLastName: "", categoryId: 0, supportingCost: 0, supportTiers: []})
    const [petitions, setPetitions] = React.useState<Petition[]>([])
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [supporters, setSupporters] = React.useState<Supporter[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [userImageFailed, setUserImageFailed] = React.useState(false);
    const [title, setTitle] = React.useState("")
    const [openLoginModal, setOpenLoginModal] = React.useState(false);
    const [openYoursModal, setOpenYoursModal] = React.useState(false);
    const [openDoubleModal, setOpenDoubleModal] = React.useState(false);

    const token = localStorage.getItem('authToken'); 
    const userId = localStorage.getItem('userId');

    const handleOpenLoginModal = () => setOpenLoginModal(true);
    const handleCloseLoginModal = () => setOpenLoginModal(false);

    const handleOpenYoursModal = () => setOpenYoursModal(true);
    const handleCloseYoursModal = () => setOpenYoursModal(false);

    const handleOpenDoubleModal = () => setOpenDoubleModal(true);
    const handleCloseDoubleModal = () => setOpenDoubleModal(false);

    const [message, setMessage] = React.useState("")

    React.useEffect(() => {
        getPetition()
        getSupporters()
        getPetitions()
        getCategories()
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

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/petitions/categories')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage(" ")
                setCategories(response.data);
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            }
        )
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
                <TextField id="outlined-basic" label="Support Message" variant="outlined"  onChange={(e) => setMessage(e.target.value)}/>
                <Button type='button' className="support-button" onClick={(e) => {supportPetition(e, item.supportTierId)}}>Support</Button>
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
                    <p className='owner-info'>
                        <OwnerImageOrAvatar ownerId={item.supporterId} ownerFirstName={item.supporterFirstName} ownerLastName={item.supporterLastName} />
                    </p>
                </div>
            )
        })
    }

    const alreadySupporting = (supportTierId: Number) => {
        let boo = false
        supporters.map((item: Supporter) => {
            if (item.supporterId === Number(userId)) {
                if (supportTierId === item.supportTierId) {
                    boo = true
                }
            }
        })
        return(boo)
    }

    const supportPetition = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, supportTierId: Number) => {
        if (!token) {
            handleOpenLoginModal()
        } else {
            if (Number(userId) === petition.ownerId) {
                handleOpenYoursModal()
            } else {
                    if (alreadySupporting(supportTierId)){
                        handleOpenDoubleModal()
                    } else {
                        if (message === "") {
                            const SupporterData = {
                                supportTierId
                            }
                            axios.post(`http://localhost:4941/api/v1/petitions/${id}/supporters`, SupporterData, { 
                                headers: {
                                'X-Authorization': token
                            }
                            })
                            .then((response) => {
                                console.log("Reponse: ", response)
                                if (response.status === 200) {
                                    navigate('/');
                                }
                            }, (error) => {
                                setErrorFlag(true);
                                setErrorMessage(error.toString())
                            });
                        } else {
                            const SupporterData = {
                                supportTierId, 
                                message
                            }
                            axios.post(`http://localhost:4941/api/v1/petitions/${id}/supporters`, SupporterData, { 
                            headers: {
                            'X-Authorization': token
                            }
                            })
                            .then((response) => {
                                console.log("Reponse: ", response)
                                if (response.status === 200) {
                                    navigate('/');
                                }
                            }, (error) => {
                                setErrorFlag(true);
                                setErrorMessage(error.toString())
                        });
                    }}
                    }
        }
    }

    const signOut = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        axios.post('http://localhost:4941/api/v1/users/logout', {}, {
            headers: {
                'X-Authorization': token
            }
        })
        .then((response) => {
            console.log("Reponse: ", response)
            if (response.status === 200) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                navigate('/');
            }
        }, (error) => {
            setErrorFlag(true);
            setErrorMessage(error.toString())
        });
    }

    const similarPetitions = () => {
        const similar = petitions.filter(p => (p.categoryId === petition.categoryId || p.ownerId === petition.ownerId) && p.petitionId !== petition.petitionId);
        return similar.map((item: Petition) => (
            <div key={item.petitionId} className="petition">
                <img 
                    src={`http://localhost:4941/api/v1/petitions/${item.petitionId}/image`}
                    alt={item.title}
                    onClick={() => navigate(`/petitions/${item.petitionId}`)}
                />
                <div className="petition-details">
                    <h4>{item.title}</h4>
                    <p>Date: {new Date(item.creationDate).toLocaleDateString()}</p>
                    <p>Category: {getCategoryNameById(item.categoryId)}</p>
                    <p className='owner-info'>
                        Owner: {item.ownerFirstName} {item.ownerLastName}
                        <OwnerImageOrAvatar ownerId={item.ownerId} ownerFirstName={item.ownerFirstName} ownerLastName={item.ownerLastName} />
                    </p>
                    <p>Lowest Cost: ${item.supportingCost}</p>
                </div>
            </div>
        ))
    }

    const getCategoryNameById = (categoryId: number) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : 'Unknown';
    }

    const status = () => {
        if (!token) {
            return (
                <header className="header">
                    <div className="logo" onClick={() => navigate(`/`)}>Petition Pledge</div>
                    <nav className="nav-links">
                        <a href="/users/register">Register</a>
                        <a href="/users/login">Login</a>
                    </nav>
                </header>
            )
        } else {
            return(
                <header className="header">
                    <div className="logo" onClick={() => navigate(`/`)}>Petition Pledge</div>
                    <nav className="nav-links">
                        <a href="/profile">Profile</a>
                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#signoutModal">
                            Log out
                        </button>
                            <div className='modal fade' id='signoutModal' tabIndex={-1} role="dialog"
                                aria-labelledby="signoutModalLabel" aria-hiddden="true">
                                    <div className="modal-dialog" role="document">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className='modal-title' id='usignoutModalLabel'>Sign out</h5>
                                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <div className='modal-footer'>
                                                Are you sure you want to sign out?
                                                <form onSubmit={(e) => signOut(e)}>
                                                    <input type="submit" value="Submit" />
                                                </form>
                                                <button type="button" className="btn btn-secondary" data-dismiss="modal">
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                    </nav>
                </header>
            )
        }
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
                {status()}
            <div className="petition-container">
                <h1 className='title'> {petition.title} </h1>
                <body>
                    <img 
                        src={`http://localhost:4941/api/v1/petitions/${petition.petitionId}/image`}
                        alt="Petition Image" className='petition-image'
                    />
                    <p><strong>Created on: </strong>{new Date(petition.creationDate).toLocaleDateString()}</p>
                    <div className="petition-details">
                        <p className='owner-info'>
                            <strong>Owner:  </strong> 
                            {petition.ownerFirstName} {petition.ownerLastName}
                            <OwnerImageOrAvatar ownerId={petition.ownerId} ownerFirstName={petition.ownerFirstName} ownerLastName={petition.ownerLastName} />
                        </p>
                        <p><strong>Description:</strong> {petition.description}</p>
                        </div>
                    </body>
                <div className='support-container'>
                        <h2>Support Us!</h2>
                        <p><strong>Number of supporters: </strong>{petition.numberOfSupporters}</p>
                        <p><strong>Money raised: </strong>${petition.moneyRaised}</p>
                        {list_of_support_tiers()}
                    </div>
                    <Modal
                        open={openLoginModal}
                        onClose={handleCloseLoginModal}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                        >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                            Login Required
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            You need to be logged in to support a petition. <Link to={'/users/register'}>Register</Link> or <Link to={'/users/login'}>Login</Link>
                            </Typography>
                        </Box>
                    </Modal>
                    <Modal
                        open={openYoursModal}
                        onClose={handleCloseYoursModal}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                        >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                            Cannot support
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            You cannot support your own petition. 
                            </Typography>
                        </Box>
                    </Modal>
                    <Modal
                        open={openDoubleModal}
                        onClose={handleCloseDoubleModal}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                        >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                            Cannot support
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            You are already supporting this petition at this tier
                            </Typography>
                        </Box>
                    </Modal>
                <div className='support-container'>
                        <h2>Our Supporters! </h2>
                        {list_of_supporters()}
                    </div>
                    <h2>Similar Petitions</h2>
                <div className="petition-grid">{similarPetitions()}</div>
            </div>
        </body>
        )
    }

}

export default Petition;