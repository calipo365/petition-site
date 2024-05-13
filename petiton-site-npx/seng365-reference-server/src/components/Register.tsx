import axios from 'axios';
import { error } from 'console';
import { get } from 'http';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { FormControl, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';


const Register = () => {
    const navigate = useNavigate();
    const [users, setUsers] = React.useState<User[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState(" ")
    const [showPassword, setShowPassword] = React.useState(false);
    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    })

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        axios.post('http://localhost:4941/api/v1/users/register')
            .then((response) => {
                console.log("Registration successful", response.data)
                navigate('/login')
            }, (error) => {
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
    };

    if (errorFlag) {
        return (
            <div>
                <h2> Register as a new user </h2>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <h2> Register as a new user </h2>
                <h6> Already have an account? <Link to={'/login'}>Log in.</Link></h6>
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
                    id="outlined-multiline-flexible"
                    label="First Name"
                    multiline
                    maxRows={4}
                    onChange={handleInputChange}
                    />
                <TextField
                    id="outlined-multiline-flexible"
                    label="Last Name"
                    multiline
                    maxRows={4}
                    onChange={handleInputChange}
                    />
                </div>
                <div>
                <TextField
                    id="outlined-multiline-flexible"
                    label="Email"
                    multiline
                    maxRows={4}
                    onChange={handleInputChange}
                    />
                </div>
                <div>
                    <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? 'text' : 'password'}
                            onChange={handleInputChange}
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    >
                                {showPassword ? <span>Show</span> : <span>Show</span>}
                                </IconButton>
                            </InputAdornment>
                            }
                            label="Password"
                        />
                    </FormControl>
                </div>
                <Button type="submit" variant="outlined">Register</Button>
                </Box>
            </div>
        )
    }

}

export default Register;