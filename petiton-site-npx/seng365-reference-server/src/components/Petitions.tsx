import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import './Petitions.css';
import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { Menu } from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(name: string, selectedNames: readonly string[], theme: Theme) {
    return {
        fontWeight:
            selectedNames.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

const Petitions = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [petitions, setPetitions] = React.useState<Petition[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState(" ")
    const [title, setTitle]= React.useState("")

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

    const getLowestCost = (supportTiers: SupportTier[]): string => {
        if (supportTiers.length === 0) {
            return "Not available";
        }
        const costs = supportTiers.map(tier => tier.cost);
        const lowestCost = Math.min(...costs);
        return `${lowestCost.toFixed(2)}`; 
    };
    

    const list_of_petitions = () => {
        const filteredPetitions = selectedCategories.length === 0 ? petitions : petitions.filter((item) => selectedCategories.includes(item.categoryId));

        return filteredPetitions.map((item: Petition) => (
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
                    <p>Owner: {item.ownerFirstName} {item.ownerLastName}</p>
                    <p>Cost:  ${getLowestCost(item.supportTiers)}</p>
                </div>
            </div>
        ));
    };

    const addPetition = (event: React.FormEvent<HTMLFormElement>) => { 
        event.preventDefault(); 
        if (title === "") { 
            alert("Please enter a title!")
        } else { 
            axios.post('http://localhost:4941/api/v1/petitions', { "title": title }) 
            .then((response) => {
                navigate('/petitions')
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
        }
    }

    const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
       const {
        target: { value },
       } = event;
       const selectedStrings = typeof value === 'string' ? value.split(',') : value;
       const selectedNumbers = selectedStrings.map(Number);
       setSelectedCategories(selectedNumbers);
    };

    const getCategoryNameById = (categoryId: number) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : 'Unknown';
    }

    const updateTitleState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    return (
        <div>
            <h2>Petition Pledge</h2>
            <div className="make-petition-container">
                <button type="button" className="make-button" data-toggle="modal" data-target="#makePetitionModal">
                        Make your own petition!
                    </button>
                        <div className='modal fade' id='makePetitionModal' tabIndex={-1} role="dialog"
                            aria-labelledby="makePetitionModalLabel" aria-hiddden="true">
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className='modal-title' id='makePetitionModalLabel'>Make a petition</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className='modal-footer'>
                                            <form onSubmit={addPetition}>
                                                <input type='text' value={title} onChange={updateTitleState} />
                                                <input type='submit' value='Submit' />
                                            </form>
                                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>
                                                Close
                                            </button>
                                        </div>  
                                    </div>
                                </div>    
                            </div>
                        </div>
                <div className="filter-container">
                    <FormControl sx={{ m: 1, width: 300}}>
                        <InputLabel id="category-multiple-chip-label">Categories</InputLabel>
                        <Select
                            labelId='category-multiple-chip-label'
                            id='category-multiple-chip'
                            multiple
                            value={selectedCategories.map(String)}
                            onChange={handleCategoryChange}
                            input={<OutlinedInput id='select-multiple-chip' label='Categories' />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={categories.find(c => c.categoryId.toString() === value)?.name} />
                                    ))}
                                </Box>
                            )}
                            MenuProps={MenuProps}
                        >
                            {categories.map((category: Category) => (
                                <MenuItem
                                    key={category.categoryId}
                                    value={category.categoryId.toString()}
                                    style={getStyles(category.name, selectedCategories.map(String), theme)}
                                >
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <div className="petition-container">
                    <div className="petition-grid">{list_of_petitions()}</div>
                </div>
        </div>
    )
}

export default Petitions;
