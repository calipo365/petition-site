import axios from 'axios';
import React, { useEffect } from 'react';
import './User.css';
import {Link, useNavigate, useParams} from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';

const Profile = () => {

    const navigate = useNavigate();

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [user, setUser] = React.useState<sentUser>({firstName: '', lastName: '', email: ''})
    const [petitions, setPetitions] = React.useState<Petition[]>([]);
    const [myPetitions, setMyPetitions] = React.useState<Petition[]>([]);
    const [image, setImage] = React.useState("")
    const token = localStorage.getItem('authToken'); 
    const userId = localStorage.getItem('userId');

    const [firstName, setFirstName]= React.useState("")
    const [lastName, setLastName]= React.useState("")
    const [email, setEmail]= React.useState("")

    const [firstNameError, setFirstNameError]= React.useState("")
    const [lastNameError, setLastNameError]= React.useState("")
    const [emailError, setEmailError]= React.useState("")

    const [oldPassword, setOldPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [passwordError, setPasswordError] = React.useState("");

    React.useEffect(() => {
        getUser()
        getPetitions()
        getCategories();
    }, [userId])

    React.useEffect(() => {
        if (petitions.length > 0) {
            const filteredPetitions = petitions.filter(petition => petition.ownerId === Number(userId));
            setMyPetitions(filteredPetitions);
        }
    }, [petitions, userId]);

    const getUser = () => {
        axios.get(`http://localhost:4941/api/v1/users/${userId}`, {headers: { 'X-Authorization': token }})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUser(response.data)
                setFirstName(response.data.firstName);
                setLastName(response.data.lastName);
                setEmail(response.data.email);
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
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

    const getPetitions = () => {
        axios.get('http://localhost:4941/api/v1/petitions')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setPetitions(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const list_of_my_petitions = () => {
        console.log("My petitions:", myPetitions)
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
                    <p>Owner: {item.ownerFirstName} {item.ownerLastName}
                        <img 
                            src={`http://localhost:4941/api/v1/users/${item.ownerId}/image`}
                            alt={item.title} className='small-image'
                        />
                    </p>
                    <p>Lowest Cost: ${item.supportingCost}</p>
                </div>
            </div>
        ));
    }

    const validateFirstName= () => {
        if (firstName.trim() === "") {
            setFirstNameError("Title is required.");
        } else {
            setFirstNameError("");
        }
    };

    const validateLastName= () => {
        if (lastName.trim() === "") {
            setLastNameError("Title is required.");
        } else {
            setLastNameError("");
        }
    };

    const validateEmail = () => {
        if (email.trim() === "") {
            setEmailError("Description is required.");
        } else {
            setEmailError("");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        validateFirstName();
        validateLastName();
        validateEmail();
       
        if ( firstNameError || lastNameError || emailError) {
            return;
        }
    
        const token = localStorage.getItem('authToken'); 
        const userId = localStorage.getItem('userId');
    
        if (!token) {
            setErrorFlag(true);
            setErrorMessage("User is not authenticated.");
            return;
        }
    
        const UserData = {
            "firstName": firstName,
            "lastName": lastName,
            "email": email
        };

        console.log("Sending user data:", UserData);
    
        axios.patch('http://localhost:4941/api/v1/users/' + userId, UserData, {
            headers: {
                'X-Authorization': token
            }
        })
        .then((response) => {
            console.log("User updated successfully", response.data)
            navigate("/")
        }, (error) => {
            console.error('User failed to update', error.response)
            setErrorFlag(true);
            setErrorMessage(error.response.data.error || "User failed to post update")
        });
    };

    const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!oldPassword || !newPassword) {
            setPasswordError("Both field are required");
            return;
        }

        const passwordData = {
            oldPassword,
            newPassword
        };

        axios.patch(`http://localhost:4941/api/v1/users/${userId}`, passwordData, {
            headers: {
                'X-Authorization': token
            }
        })
        .then((response) => {
            console.log("Password changed successfully", response.data);
            setOldPassword("");
            setNewPassword("");
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
    

    if (errorFlag) {
        return (
            <div>
                <h1>Profile</h1>
                <div style={{ color:"red" }}>
                    {errorMessage}
                </div>
                <Link to={"/"}> Back to Homepage</Link>
            </div>
        )
    } else {
        if (!token) {
            return (
                <div>
                <h2>Profile</h2>
                <div style={{ color:"red" }}>
                    {errorMessage}
                </div>
                <Link to={"/"}> Back to Homepage</Link>
                <Link to={"/users/register"}> Create an account</Link>
                <Link to={"/users/login"}> Login to an existing account</Link>
            </div>
            )
        } else {
            return (
                <div>
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
                                            value={oldPassword}
                                            onChange={(event) => setOldPassword(event.target.value)}
                                            fullWidth
                                            margin='normal'
                                        />
                                        <TextField
                                            id="newPassword"
                                            label="New Password"
                                            type='password'
                                            value={newPassword}
                                            onChange={(event) => setNewPassword(event.target.value)}
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
                <div className='user'>
                <img 
                    src={`http://localhost:4941/api/v1/users/${userId}/image`}
                    alt='User profile'
                />
                </div>
                <div>
                    <h2>Your petitions</h2>
                    {list_of_my_petitions()}
                </div>
            </div>
            )
        }
    }
}

export default Profile;