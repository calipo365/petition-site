import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';

const Profile = () => {

    const navigate = useNavigate();

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [userName, setUserName] = React.useState<UserName>({firstName: '', lastName: ''})
    const [image, setImage] = React.useState("")
    const token = localStorage.getItem('authToken'); 
    const userId = localStorage.getItem('userId');

    React.useEffect(() => {
        getUser()
    }, [userId])


    const getUser = () => {
        axios.get('http://localhost:4941/api/v1/users/' + userId)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUserName(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

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
                <div>
                    <h2>Profile</h2>
                    <div style={{ color:"red" }}>
                        {errorMessage}
                    </div>
                    <Link to={"/"}> Back to Homepage</Link>
                    <Link to={"/users/register"}> Create an account</Link>
                    <Link to={"/users/login"}> Login to an existing account</Link>
                </div>
            } else {
                <div>
                    <h2>Your Profile</h2>
                    {userName.firstName}
                    {userName.lastName}

                    <img 
                        src={`http://localhost:4941/api/v1/users/${userId}/image`}
                    />
                </div>
            }
    }
}

export default Profile;