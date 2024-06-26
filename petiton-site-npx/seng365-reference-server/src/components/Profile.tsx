import axios from 'axios';
import React, { ChangeEventHandler, useEffect } from 'react';
import './Profile.css';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { pink } from '@mui/material/colors';

interface OwnerImageOrAvatarProps {
    ownerId: number;
    ownerFirstName: string;
    ownerLastName: string;
}

const SmallOwnerImageOrAvatar: React.FC<OwnerImageOrAvatarProps> = ({ ownerId, ownerFirstName, ownerLastName }) => {
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

const LargeOwnerImageOrAvatar: React.FC<OwnerImageOrAvatarProps> = ({ ownerId, ownerFirstName, ownerLastName }) => {
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
                className='user-img'
                onError={handleImageError}
            />
        )
    );
};

const Profile = () => {
    const navigate = useNavigate();

    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [user, setUser] = React.useState({ firstName: '', lastName: '', email: '' });
    const [petitions, setPetitions] = React.useState<Petition[]>([]);
    const [myPetitions, setMyPetitions] = React.useState<Petition[]>([]);
    const [mySupportedPetitions, setMySupportedPetitions] = React.useState<Petition[]>([]);
    const token = localStorage.getItem('authToken'); 
    const userId = localStorage.getItem('userId');

    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [email, setEmail] = React.useState("");

    const [firstNameError, setFirstNameError] = React.useState("");
    const [lastNameError, setLastNameError] = React.useState("");
    const [emailError, setEmailError] = React.useState("");

    const [currentPassword, setCurrentPassword] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [passwordError, setPasswordError] = React.useState("");

    useEffect(() => {
        getUser();
        getPetitions();
        getCategories();
    }, [userId]);

    useEffect(() => {
        if (petitions.length > 0) {
            const filteredPetitions = petitions.filter(petition => petition.ownerId === Number(userId));
            setMyPetitions(filteredPetitions);
            getSupportedPetitions();
        }
    }, [petitions, userId]);

    const getUser = () => {
        axios.get(`http://localhost:4941/api/v1/users/${userId}`, { headers: { 'X-Authorization': token } })
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setUser(response.data);
                setFirstName(response.data.firstName);
                setLastName(response.data.lastName);
                setEmail(response.data.email);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/petitions/categories')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setCategories(response.data);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const getPetitions = () => {
        axios.get('http://localhost:4941/api/v1/petitions')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setPetitions(response.data.petitions);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const getSupportedPetitions = async () => {
        const supportedPetitions: Petition[] = [];
    
        const fetchSupporters = petitions.map(async (petition) => {
            try {
                const response = await axios.get(`http://localhost:4941/api/v1/petitions/${petition.petitionId}/supporters`);
                const supporters: Supporter[] = response.data;
                const userIsSupporter = supporters.some(supporter => supporter.supporterId === Number(userId));
                if (userIsSupporter) {
                    supportedPetitions.push(petition);
                }
            } catch (error) {
                console.error(`Error fetching supporters for petition ${petition.petitionId}:`, error);
            }
        });
    
        await Promise.all(fetchSupporters);
        setMySupportedPetitions(supportedPetitions);
    };
    

    const list_of_my_petitions = () => {
        return myPetitions.map((item: Petition) => (
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
                        <SmallOwnerImageOrAvatar ownerId={item.ownerId} ownerFirstName={item.ownerFirstName} ownerLastName={item.ownerLastName} />
                    </p>
                    <p>Lowest Cost: ${item.supportingCost}</p>
                </div>
                <button type='button' onClick={() => navigate('/petitions/' + item.petitionId + '/manage')}>
                    Manage Petition
                </button>
            </div>
        ));
    };

    const list_of_my_supported_petitions = () => {
        return mySupportedPetitions.map((item: Petition) => (
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
                        <SmallOwnerImageOrAvatar ownerId={item.ownerId} ownerFirstName={item.ownerFirstName} ownerLastName={item.ownerLastName} />
                    </p>
                    <p>Lowest Cost: ${item.supportingCost}</p>
                </div>
            </div>
        ));
    };

    const validateFirstName = () => {
        if (firstName === "") {
            setFirstNameError("First name is required.");
        } else {
            setFirstNameError("");
        }
    };

    const validateLastName = () => {
        if (lastName === "") {
            setLastNameError("Last name is required.");
        } else {
            setLastNameError("");
        }
    };

    const validateEmail = () => {
        if (email === "") {
            setEmailError("Email is required.");
        } else {
            setEmailError("");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        validateFirstName();
        validateLastName();
        validateEmail();

        if (firstNameError || lastNameError || emailError) {
            return;
        }

        if (!token) {
            setErrorFlag(true);
            setErrorMessage("User is not authenticated.");
            return;
        }

        const UserData = {
            email,
            firstName,
            lastName
        };

        axios.patch(`http://localhost:4941/api/v1/users/${userId}`, UserData, {
            headers: {
                'X-Authorization': token
            }
        })
        .then((response) => {
            console.log("User updated successfully", response.data);
            navigate("/");
        }, (error) => {
            console.error('User failed to update', error.response);
            setErrorFlag(true);
            setErrorMessage(error.response.data.error || "User failed to post update");
        });
    };

    const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!currentPassword || !password) {
            setPasswordError("Both fields are required.");
            return;
        }

        const passwordData = {
            currentPassword,
            password
        };

        console.group("Password data: ", passwordData)

        axios.patch(`http://localhost:4941/api/v1/users/${userId}`, passwordData, {
            headers: {
                'X-Authorization': token
            }
        })
        .then((response) => {
            console.log("Password changed successfully", response.data);
            setCurrentPassword("");
            setPassword("");
            setPasswordError("");
            navigate("/");
        }, (error) => {
            console.error('Password change failed', error.response);
            setPasswordError(error.response.data.error || "Failed to change password");
        });
    };

    const getCategoryNameById = (categoryId: number) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : 'Unknown';
    };

    const signOut = (event: React.FormEvent<HTMLFormElement>) => {
        console.log("Token: ", token)
        event.preventDefault();
        axios.post('http://localhost:4941/api/v1/users/logout', {}, {
            headers: {
                'X-Authorization': token
            }
        })
        .then((response) => {
            if (response.status === 200) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                navigate('/');
                refreshPage()
            }
        }, (error) => {
            setErrorFlag(true);
            setErrorMessage(error.toString())
        });
    }

    const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            await axios.put(`http://localhost:4941/api/v1/users/${userId}/image`, file, {
                headers: {
                    'X-Authorization': token,
                    'Content-Type': file.type
                }
            })
            .then((response) => {
                navigate('/')
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString())
                console.log("Error: ", error.toString())
                console.log("Failed to update picture")
            });
        }
    }

    const deleteImage = async () => {
        await axios.delete(`http://localhost:4941/api/v1/users/${userId}/image`, {
                headers: {
                    'X-Authorization': token,
                }
            })
            .then((response) => {
                navigate('/')
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString())
                console.log("Failed to delete picture")
            });
    }

    function refreshPage(){ 
        window.location.reload(); 
    }


    if (errorFlag) {
        return (
            <div>
                <h1>Profile</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
                <Link to={"/"}> Back to Homepage</Link>
            </div>
        );
    } else {
        if (!token) {
            return (
                <div>
                    <h2>Profile</h2>
                    <div style={{ color: "red" }}>
                        {errorMessage}
                    </div>
                    <Link to={"/"}> Back to Homepage</Link>
                    <Link to={"/users/register"}> Create an account</Link>
                    <Link to={"/users/login"}> Login to an existing account</Link>
                </div>
            );
        } else {
            return (
                <div>
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
                    <h2>Your Profile</h2>
                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '25ch' },
                        }}
                        noValidate
                        autoComplete="off"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <TextField
                                id="outlined-controlled"
                                label="First Name"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                            />
                            <TextField
                                id="outlined-controlled"
                                label="Last Name"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                            />
                            <TextField
                                id="outlined-controlled"
                                label="Email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>  
                        <Button type="submit" variant="outlined">Update Profile</Button> 
                    </Box>
                    <h2></h2>
                    <button type='button' className='btn btn-primary' data-toggle='modal' data-target='#changePasswordModal'>
                        Change password
                    </button>
                    <div className='modal fade' id='changePasswordModal' tabIndex={-1} role='dialog'
                        aria-labelledby='changePasswordModalLabel' aria-hidden='true'>
                        <div className='modal-dialog' role='document'>
                            <div className='modal-content'>
                                <div className='modal-header'>
                                    <h5 className='modal-title' id='changePasswordModalLabel'>Change password</h5>
                                    <button type='button' className='close' data-dismiss='modal' aria-label='close'>
                                        <span aria-hidden='true'>&times;</span>
                                    </button>
                                </div>
                                <div className='modal-body'>
                                    <form onSubmit={changePassword}>
                                        <TextField
                                            id="oldPassword"
                                            label="Old Password"
                                            type='password'
                                            value={currentPassword}
                                            onChange={(event) => setCurrentPassword(event.target.value)}
                                            fullWidth
                                            margin='normal'
                                        />
                                        <TextField
                                            id="newPassword"
                                            label="New Password"
                                            type='password'
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            fullWidth
                                            margin='normal'
                                        />
                                        {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
                                        <Button type="submit" variant='outlined'>Submit</Button>
                                    </form>
                                </div>
                                <div className='modal-footer'>
                                    <button type='button' className='btn btn-secondary' data-dismiss='modal'>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className='owner-info'>
                        <LargeOwnerImageOrAvatar ownerId={Number(userId)} ownerFirstName={firstName} ownerLastName={lastName} />
                    </p>
                    Update or delete your profile picture:
                    <input type="file" onChange={handleImageChange} />
                    <button type="button" onClick={() => deleteImage()}>Delete Profile Picture</button>
                    <div>
                        <h2 className='your-petitions'>Your petitions</h2>
                        <div className="petition-container">
                        <div className="petition-grid">{list_of_my_petitions()}</div>
                        </div>
                        <h2>Your Supported Petitions</h2>
                        <div className="petition-container">
                        <div className="petition-grid">{list_of_my_supported_petitions()}</div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default Profile;
