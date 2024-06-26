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
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import Avatar from '@mui/material/Avatar';
import { pink } from '@mui/material/colors';
import { Button } from '@mui/material';


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

const Petitions = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const token = localStorage.getItem('authToken'); 
    const userId = localStorage.getItem('userId');

    const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [sort, setSort] = React.useState("Petition name A-Z")
    const [selectedCostGroups, setSelectedCostGroups] = React.useState<string[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
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
        })
        .filter((item) => {
            const searchLower = searchTerm.toLowerCase();
            return item.title.toLowerCase().includes(searchLower) || (item.description && item.description.toLowerCase().includes(searchLower));
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
                    <p className='owner-info'>
                        Owner: {item.ownerFirstName} {item.ownerLastName}
                        <OwnerImageOrAvatar ownerId={item.ownerId} ownerFirstName={item.ownerFirstName} ownerLastName={item.ownerLastName} />
                    </p>
                    <p>Lowest Cost: ${item.supportingCost}</p>
                </div>
            </div>
        ));
    };

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
                refreshPage()
            }
        }, (error) => {
            setErrorFlag(true);
            setErrorMessage(error.toString())
        });
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

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    }

    function PortraitIcon(props: SvgIconProps) {
        return (
          <SvgIcon {...props}>
            <path d="M12 12.25c1.24 0 2.25-1.01 2.25-2.25S13.24 7.75 12 7.75 9.75 8.76 9.75 10s1.01 2.25 2.25 2.25m4.5 4c0-1.5-3-2.25-4.5-2.25s-4.5.75-4.5 2.25V17h9zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14z" />
          </SvgIcon>
        );
    }

    function refreshPage(){ 
        window.location.reload(); 
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
                <h2> Petiton Pledge </h2>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
            </div>
        )
    } else {
        return (
            <div>
                {status()}
                <header className='body'>
                    <nav className="nav-links">
                        <a href="/create">Make your own petition!</a>
                    </nav>
                </header>
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
                        <FormControl fullWidth sx={{ m: 1 }}>
                            <InputLabel htmlFor='search-box'>Search Petitions</InputLabel>
                            <OutlinedInput
                                id="search-box"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                label="Search Petitions"
                            />
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
