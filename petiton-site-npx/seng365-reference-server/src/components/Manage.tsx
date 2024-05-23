import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { deepOrange } from '@mui/material/colors';
import { Box, Theme, useTheme } from '@mui/system';
import { Button, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, TextField } from '@mui/material';
import { Description } from '@mui/icons-material';

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

const Manage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    const token = localStorage.getItem('authToken'); 
    const userId = localStorage.getItem('userId');

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [petition, setPetition] = React.useState<Petition>({petitionId: 0, title: "", description: "", creationDate: new Date(), image_filename: "",ownerId: 0, ownerFirstName: "", numberOfSupporters: 0, moneyRaised: 0, ownerLastName: "", categoryId: 0, supportingCost: 0, supportTiers: []})
    const [supporters, setSupporters] = React.useState<Supporter[]>([]);
    const [userImageFailed, setUserImageFailed] = React.useState(false);
    
    const [title, setTitle] = React.useState("")
    const [description, setDescription] = React.useState("")

    const [titleError, setTitleError] = React.useState("")
    const [descriptionError, setDescriptionError] = React.useState("")

    const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
    const [categories, setCategories] = React.useState<Category[]>([]);

    const [titleTouched, setTitleTouched]= React.useState(false);
    const [descriptionTouched, setDescriptionTouched] = React.useState(false)
    const [categoryIdTouched, setCategoryIdTouched] = React.useState(false)
    const [supportTierTouched, setSupportTierTouched] =React.useState(false)
    const [imageTouched, setImageTouched] = React.useState(false)

    const [supportTier, setSupportTier] = React.useState<{ supportTierId: number, title: string, description: string, cost: number }>({ supportTierId: 0, title: '', description: '', cost: 0 });


    React.useEffect(() => {
        getPetition()
        getSupporters()
        getCategories()
    }, [id])

    const getPetition = () => {
        axios.get('http://localhost:4941/api/v1/petitions/' + id)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setPetition(response.data)
                setTitle(response.data.title)
                setDescription(response.data.description)
                setSelectedCategory(response.data.categoryId)
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
            <div key={item.supportTierId} className='tiers-details'>
                <h5>{item.title}</h5>
                    <p>{item.description}</p>
                    <p>{item.cost}</p>
            </div>
        ));
    };

    const list_of_supporters = () => {
        return supporters.map((item: Supporter) => {
            const tier = petition.supportTiers.find(tier => tier.supportTierId === item.supportTierId);
            const tierTitle = tier ? tier.title : 'Tier not found';
            return(
                <div key={item.supportId}>
                    <p>{tierTitle}</p>
                    <p>{item.message}</p>
                    <p>{new Date(item.timestamp).toLocaleDateString()}</p>
                    {userImageFailed ? (
                            <Avatar sx={{ bgcolor: deepOrange[500]}} className='supporter-img'>
                                {petition.ownerFirstName[0]}{petition.ownerLastName[0]}
                            </Avatar>
                        ) : (
                            <img 
                                src={`http://localhost:4941/api/v1/users/${item.supporterId}/image`}
                                alt={petition.ownerFirstName} className='supporter-img'
                            />
                        )}
                </div>
            )
        })
    }

    const deletePetition = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, petition: Petition) => {
        if (supporters.length > 0) {
            console.log("Cannot delete there are supporters")
        } else {
            event.preventDefault();
            axios.delete('http://localhost:4941/api/v1/petitions/' + petition.petitionId, {
                headers: {
                    'X-Authorization': token
                }
            })
                .then((response) => {
                    navigate('/profile')
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
            }
        }

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        const {
            target: { value },
        } = event;
        const selectedNumber = Number(value);
        setSelectedCategory(selectedNumber);
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
            }
        }, (error) => {
            setErrorFlag(true);
            setErrorMessage(error.toString())
        });
    }

    const validateTitle = () => {
        if (title.trim() === "") {
            setTitleError("Title is required.");
        } else {
            setTitleError("");
        }
    };

    const validateDescription = () => {
        if (description.trim() === "") {
            setDescriptionError("Description is required.");
        } else {
            setDescriptionError("");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        validateTitle();
        validateDescription();
        
        if ( titleError || descriptionError ) {
            return;
        }

        if (!token) {
            setErrorFlag(true);
            setErrorMessage("User is not authenticated.");
            return;
        }

        const categoryId = selectedCategory

        const PetitionData = {
            title,
            description, 
            categoryId
        };

        axios.patch(`http://localhost:4941/api/v1/petitions/${id}`, PetitionData, {
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

    const addSupportTier = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();

        if (petition.supportTiers.length >= 3) {
            setErrorFlag(true)
            setErrorMessage("You cannot add more than three support tiers")
            return;
        }

        console.log("Support tier: ", supportTier)

        axios.put(`http://localhost:4941/api/v1/petitions/${id}/supportTiers`, supportTier, {
            headers: {
                'X-Authorization': token
            }
        })
        .then((response) => {
            console.log("Petition support tier added successfully", response.data);
            navigate(`/profile`);
        }, (error) => {
            console.error('Petition support tier failed to be added', error.response);
            setErrorFlag(true);
            setErrorMessage(error.response.data.error || "Petition support tier failed to be added");
        });
    }

    const editSupportTier = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, supportTierId: number) => {
        event.preventDefault();
        const supportTierToEdit = petition.supportTiers.find(t => t.supportTierId === supportTierId);
        axios.patch(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${supportTierId}`, supportTierToEdit, {
            headers: {
                'X-Authorization': token
            }
        })
        .then((response) => {
            console.log("Petition support tier added successfully", response.data);
            navigate(`/profile`);
        }, (error) => {
            console.error('Petition support tier failed to be added', error.response);
            setErrorFlag(true);
            setErrorMessage(error.response.data.error || "Petition support tier failed to be added");
        });
    }

    const deleteSupportTier = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, supportTierId: number) => {
        event.preventDefault();
        axios.delete(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${supportTierId}`, {
            headers: {
                'X-Authorization': token
            }
        })
        .then((response) => {
            console.log("Petition support tier deleted successfully", response.data);
            navigate(`/profile`);
        }, (error) => {
            console.error('Petition support tier failed to be deleted', error.response);
            setErrorFlag(true);
            setErrorMessage(error.response.data.error || "Petition support tier failed to be adddeleteded");
        });
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

    const displaySupportTiers = () => {
        return petition.supportTiers.map((tier) => {
            const tierHasSupporters = supporters.some(supporter => supporter.supportTierId === tier.supportTierId);
            return (
                <div key={tier.supportTierId} className='tier-details'>
                    <h5>Support Tier</h5>
                    <Box sx={{ display: 'flex', gap: 1, m: 1 }}>
                        <TextField
                            label="Title"
                            value={tier.title}
                            disabled={tierHasSupporters}
                            onChange={(e) => {
                                const newTiers = petition.supportTiers.map(t => t.supportTierId === tier.supportTierId ? { ...t, title: e.target.value } : t);
                                setPetition({ ...petition, supportTiers: newTiers });
                            }}
                        />
                        <TextField
                            label="Description"
                            value={tier.description}
                            disabled={tierHasSupporters}
                            onChange={(e) => {
                                const newTiers = petition.supportTiers.map(t => t.supportTierId === tier.supportTierId ? { ...t, description: e.target.value } : t);
                                setPetition({ ...petition, supportTiers: newTiers });
                            }}
                        />
                        <TextField
                            label="Cost"
                            type="number"
                            value={tier.cost}
                            disabled={tierHasSupporters}
                            onChange={(e) => {
                                const newTiers = petition.supportTiers.map(t => t.supportTierId === tier.supportTierId ? { ...t, cost: Number(e.target.value) } : t);
                                setPetition({ ...petition, supportTiers: newTiers });
                            }}
                        />
                        <Button
                            type="button"
                            onClick={(event) => editSupportTier(event, tier.supportTierId)}
                        >
                            {"Update tier"}
                        </Button>
                        <Button type="button" onClick={(event) => deleteSupportTier(event, tier.supportTierId)}>Delete Tier</Button>
                    </Box>
                </div>
            )
        })
    }

    if (errorFlag) {
        return (
            <div>
                <h1>Manage your petition</h1>
                <div style={{ color:"red" }}>
                    {errorMessage}
                </div>
                <Link to={"/profile"}> Back to Profile</Link>
            </div>
        )
    } else {
        return (
            <div>
                {status()}
                <div>
                <h2>Your Petition</h2>
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
                        error={titleTouched && !!titleError}
                        id="outlined-controlled"
                        label="Title"
                        value = {title}
                        multiline
                        maxRows={4}
                        helperText={titleTouched ? titleError : ""}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            setTitleTouched(true);
                            validateTitle();
                        }}
                        />
                        <FormControl sx={{ m: 1, width: 300 }}>
                            <InputLabel id="category-chip-label">Category</InputLabel>
                            <Select
                                labelId='category-chip-label'
                                id='category-chip'
                                value={selectedCategory?.toString() || ''}
                                onChange={handleCategoryChange}
                                input={<OutlinedInput id='select-chip' label='Category' />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        <Chip key={selected} label={categories.find(c => c.categoryId.toString() === selected)?.name} />
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                            >
                                {categories.map((category: Category) => (
                                    <MenuItem
                                        key={category.categoryId}
                                        value={category.categoryId.toString()}
                                    >
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div>
                        <TextField
                            error={descriptionTouched && !!descriptionError}
                            id="outlined-description"
                            label="Description"
                            value={description}
                            multiline
                            rows={4}
                            helperText={descriptionTouched ? descriptionError : ""}
                            onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => {
                                    setDescriptionTouched(true);
                                    validateDescription();
                                }}
                            />
                        </div>
                        </div>  
                            <Button type="submit" variant="outlined">Update Petition</Button> 
                        </Box>
                    <body>
                        <img 
                            src={`http://localhost:4941/api/v1/petitions/${petition.petitionId}/image`}
                            alt={petition.title} className='petition-img'
                        />
                    </body>
                    <Button type="button" onClick={(event) => deletePetition(event, petition)}>Delete Petition</Button>
                </div>
                <div className='support-container'>
                    <h4>Your support Tiers: </h4>
                    <body>*Tiers with supporters cannot be edited</body>
                    <h4></h4>
                    {displaySupportTiers()}
                </div>
                <div className='support-container'>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, m: 1 }}>
                        <h6>Information for support tier</h6>
                        <TextField
                            label={'Title'}
                            value={supportTier.title}
                            onChange={(e) => setSupportTier({ ...supportTier, title: e.target.value })}
                        />
                        <TextField
                            label={'Description'}
                            value={supportTier.description}
                            onChange={(e) => setSupportTier({ ...supportTier, description: e.target.value })}
                        />
                        <TextField
                            label={'Cost'}
                            type="number"
                            value={supportTier.cost}
                            onChange={(e) => setSupportTier({ ...supportTier, cost: Number(e.target.value) })}
                        />
                        <Button
                                type="button"
                                onClick={(event) => addSupportTier(event)}
                                disabled={petition.supportTiers.length >= 3}
                            >
                                {petition.supportTiers.length >= 3 ? "Cannot add more tiers" : "Add Tier"}
                            </Button>
                    </Box>
                </div>
            </div>
        )
    }
}

export default Manage;