import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { FormControl, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';


const Register = () => {
    const navigate = useNavigate();
    const [users, setUsers] = React.useState<User[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState(" ")
    const [showPassword, setShowPassword] = React.useState(false);
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [file, setFile] = React.useState<File | null>(null);

    const token = localStorage.getItem('authToken'); 
    const userId = localStorage.getItem('userId');

    const [firstNameError, setFirstNameError] = React.useState("")
    const [lastNameError, setLastNameError] = React.useState("")
    const [emailError, setEmailError] = React.useState("")
    const [passwordError, setPasswordError] = React.useState("")

    const [firstNameTouched, setFirstNameTouched] = React.useState(false);
    const [lastNameTouched, setLastNameTouched] = React.useState(false);
    const [emailTouched, setEmailTouched] = React.useState(false);
    const [passwordTouched, setPasswordTouched] = React.useState(false);

    const validateFirstName = () => {
        if (firstName.trim() === "") {
            setFirstNameError("First name is required.");
        } else {
            setFirstNameError("");
        }
    };

    const validateLastName = () => {
        if (lastName.trim() === "") {
            setLastNameError("Last name is required.");
        } else {
            setLastNameError("");
        }
    };

    const validateEmail = () => {
        const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        if (!emailRegex.test(email)) {
            setEmailError("Invalid email format. (Capitals also not accepted)");
        } else {
            setEmailError("");
        }
    };

    const validatePassword = () => {
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
        } else {
            setPasswordError("");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        validateFirstName();
        validateLastName();
        validateEmail();
        validatePassword();
       
        if (firstNameError || lastNameError || emailError || passwordError) {
            return;
        }

        axios.post('http://localhost:4941/api/v1/users/register', { "firstName": firstName, "lastName": lastName, "email": email, "password": password })
            .then((response: any) => {
                axios.post('http://localhost:4941/api/v1/users/login', { "email": email, "password": password })
                .then((response2: any) => {
                    localStorage.setItem('authToken', response2.data.token);
                    console.log("Set token: ", response2.data.token)
                    localStorage.setItem('userId', response2.data.userId);
                    if (file != null) {
                        axios.put(`http://localhost:4941/api/v1/users/${response2.data.userId}/image`, file, {
                            headers: {
                                'X-Authorization': response2.data.token,
                                'Content-Type': file.type
                            }
                        })
                        .then((response: any) => {
                            console.log("Added image")
                            refreshPage()
                        }, (error: any) => {
                            setErrorFlag(true);
                            setErrorMessage(error.toString())
                            console.log("Error: ", error.toString())
                            console.log("Failed to add/update picture")
                        })
                    }
                })
                navigate("/")

            }, (error: any) => {
                console.error('Registration failed', error.response)
                setErrorFlag(true);
                setErrorMessage(error.response.data.error || "Failed to register")
            }
        )
    }
    
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    }

    const updatePasswordState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }

    const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        const fileHere = event.target.files ? event.target.files[0] : null;
        console.log('File: ', fileHere)
        setFile(fileHere)
    }

    function VisiblityIcon(props: SvgIconProps) {
        return (
          <SvgIcon {...props}>
            <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4m0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 14 12 14s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7" />
          </SvgIcon>
        );
    }

    function VisiblityOffIcon(props: SvgIconProps) {
        return (
          <SvgIcon {...props}>
            <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6m-1.07 1.14L13 9.21c.57.25 1.03.71 1.28 1.28l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.05-1.07.14M2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45zm7.5 7.5 2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13m-3.4-3.4 1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53" />
          </SvgIcon>
        );
    }

    function refreshPage(){ 
        window.location.reload(); 
    }

    if (errorFlag) {
        return (
            <div>
                <h2> Register as a new user </h2>
                <div style={{ color: "red" }}>
                    {errorMessage}
                    <h1></h1>
                    <Link to={'/users/register'} onClick={ refreshPage }>Try again</Link>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <header className="header">
                    <div className="logo" onClick={() => navigate(`/`)}>Petition Pledge</div>
                    <nav className="nav-links">
                        <a href="/users/register">Register</a>
                        <a href="/users/login">Login</a>
                    </nav>
                </header>
                <h2> Register as a new user </h2>
                <h6> Already have an account? <Link to={'/users/login'}>Log in.</Link></h6>
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
                    error={firstNameTouched && !!firstNameError}
                    id="outlined-first-name"
                    label="First Name"
                    multiline
                    maxRows={4}
                    helperText={firstNameTouched ? firstNameError : ""}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => {
                        setFirstNameTouched(true);
                        validateFirstName();
                    }}
                />
                <TextField
                    error={lastNameTouched && !!lastNameError}
                    id="outlined-last-name"
                    label="Last Name"
                    multiline
                    maxRows={4}
                    helperText={lastNameTouched ? lastNameError : ""}
                    onChange={(e) => setLastName(e.target.value)}
                        onBlur={() => {
                            setLastNameTouched(true);
                            validateLastName();
                        }}
                    />
                </div>
                <div>
                <TextField
                    error={emailTouched && !! emailError}
                    id="outlined-email"
                    label="Email"
                    multiline
                    maxRows={4}
                    helperText={emailTouched ? emailError : ""}
                    onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => {
                            setEmailTouched(true);
                            validateEmail();
                        }}
                    />
                </div>
                <div>
                    <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? 'text' : 'password'}
                            onChange={updatePasswordState}
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    >
                                {showPassword ? <VisiblityIcon /> : <VisiblityOffIcon />}
                                </IconButton>
                            </InputAdornment>
                            }
                            label="Password"
                        />
                    </FormControl>
                </div>
                Pasword must be atleast 6 characters
                <h1></h1>
                <div>
                    <h6> Add a profile picture (optional): </h6>
                    <input type="file" onChange={handleImageChange}/>
                </div>
                <Button type="submit" variant="outlined">Register</Button>
                </Box>
            </div>
        )
    }

}

export default Register;