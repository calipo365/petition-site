import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';

const Create = () => {
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState(" ")
    const [petitions, setPetitions] = React.useState<Petition[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);

    const [title, setTitle]= React.useState("")
    const [description, setDescription] = React.useState("")
    const [categoryId, setCategoryId] = React.useState("")
    const [supportTier, setSupportTier] = React.useState("")
    const [image, setImage] = React.useState("")

    const [titleError, setTitleError]= React.useState("")
    const [descriptionError, setDescriptionError] = React.useState("")
    const [categoryIdError, setCategoryIdError] = React.useState("")
    const [supportTierError, setSupportTierError] = React.useState("")
    const [imageError, setImageError] = React.useState("")

    React.useEffect(() => {
        getPetitions()
        getCategories();
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

    return (
        <div>
            Create a petition
        </div>
    )
}

export default Create;