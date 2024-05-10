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
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

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

const costGroups = [
    { label: "$0", min: 0, max: 0 },
    { label: "$1 - $10", min: 1, max: 10 },
    { label: "$20 - $30", min: 20, max: 30 },
    { label: "$31 - $50", min: 31, max: 50 },
    { label: "Over $50", min: 51, max: Infinity }
];

const SortGroups = [
    { label: "Petition name A-Z"}, 
    { label: "Petition name Z-A"},
    { label: "Price - Lowest first"},
    { label: "Price - Highest first"},
    { label: "Oldest posted" },
    { label: "Newest posted" }
]

const Petitions = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [sort, setSort] = React.useState("Petition name A-Z")
    const [selectedCostGroups, setSelectedCostGroups] = React.useState<string[]>([]);
    const [petitions, setPetitions] = React.useState<Petition[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState(" ")
    const [title, setTitle]= React.useState("")

    const [currentPage, setCurrentPage] = React.useState(1);
    const petitionsPerPage = 9;

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

    const filterByCostGroup = (lowestCost: number) => {
        if (lowestCost < 0) return false;
        return selectedCostGroups.some((groupLabel) => {
            const group = costGroups.find((g) => g.label === groupLabel);
            return group && lowestCost >= group.min && lowestCost <= group.max;
        });
    };

    const list_of_petitions = () => {
        const filteredPetitions = petitions
        .filter((item) =>
            selectedCategories.length === 0 || selectedCategories.includes(item.categoryId)
        )
        .filter((item) => {
            const lowestCost = item.supportingCost;
            return selectedCostGroups.length === 0 || filterByCostGroup(lowestCost);
        });

        const sortedPetitions = filteredPetitions.sort((a, b) => {
            switch (sort) {
                case "Petition name A-Z":
                    return a.title.localeCompare(b.title)
                case "Petition name Z-A":
                    return b.title.localeCompare(a.title);
                case "Price - Lowest first":
                    return a.supportingCost - b.supportingCost;
                case "Price - Highest first":
                    return b.supportingCost - a.supportingCost;
                case "Oldest posted":
                    return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
                case "Newest posted":
                    return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
                default:
                    return 0;
            }
        });

        const startIndex = (currentPage - 1) * petitionsPerPage;
        const endIndex = startIndex + petitionsPerPage;
        const currentPetitions = sortedPetitions.slice(startIndex, endIndex);

        return currentPetitions.map((item: Petition) => (
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

    const handleCostGroupChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        setSelectedCostGroups(typeof value === 'string' ? value.split(',') : value);
    };

    const handleSortChange = (event: SelectChangeEvent<string>) => {
        const {
            target: { value },
        } = event;
        setSort(value);
    };

    const getCategoryNameById = (categoryId: number) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : 'Unknown';
    }

    const updateTitleState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    }

    if (errorFlag) {
        return (
            <div>
                <h2> Petiton Pledge </h2>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
            </div>
        )
    } else {
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
                        <FormControl sx={{ m: 1, width: 300 }}>
                        <InputLabel id="cost-group-multiple-chip-label">Cost</InputLabel>
                        <Select
                            labelId='cost-group-multiple-chip-label'
                            id='cost-group-multiple-chip'
                            multiple
                            value={selectedCostGroups}
                            onChange={handleCostGroupChange}
                            input={<OutlinedInput id='select-multiple-chip' label='Cost' />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                            MenuProps={MenuProps}
                        >
                            {costGroups.map((group) => (
                                <MenuItem
                                    key={group.label}
                                    value={group.label}
                                    style={getStyles(group.label, selectedCostGroups, theme)}
                                >
                                    {group.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    </div>
                    <div className='sort-container'>
                        <FormControl sx={{ m: 1, width: 300 }}>
                            <InputLabel id="sort-select-label">Sort By</InputLabel>
                            <Select
                                labelId='sort-select-label'
                                id='sort-select'
                                value={sort}
                                onChange={handleSortChange}
                                label='Sort By'
                            >
                                {SortGroups.map((group) => (
                                    <MenuItem key={group.label} value={group.label}>
                                        {group.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="petition-container">
                        <div className="petition-grid">{list_of_petitions()}</div>
                        <Stack spacing={2} alignItems="center">
                        <Pagination
                            count={Math.ceil(petitions.length / petitionsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            variant="outlined"
                            shape="rounded"
                        />
                    </Stack>
                    </div>
            </div>
        )
    }
}

export default Petitions;
