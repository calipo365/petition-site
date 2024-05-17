import axios from 'axios';
import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { FormControl, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import { pink } from '@mui/material/colors';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

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

const Create = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState(" ")
    const [petitions, setPetitions] = React.useState<Petition[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
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

    const [titleTouched, setTitleTouched]= React.useState(false);
    const [descriptionTouched, setDescriptionTouched] = React.useState(false)
    const [categoryIdTouched, setCategoryIdTouched] = React.useState(false)
    const [supportTierTouched, setSupportTierTouched] =React.useState(false)
    const [imageTouched, setImageTouched] = React.useState(false)

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

    const validateTitle= () => {
        if (title.trim() === "") {
            setTitleError("Title is required.");
        } else {
            setTitleError("");
        }
    };

    const validateDescription = () => {
        if (description.trim() === "") {
            setDescription("Description is required.");
        } else {
            setDescription("");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        validateTitle();
        validateDescription();
       
        if (titleError || description ) {
            return;
        }

        axios.post('http://localhost:4941/api/v1/petitions', { "title": title, "description": description, "categoryId " : selectedCategory })
            .then((response) => {
                console.log("Petition posted successfully", response.data)
                navigate("/")
            }, (error) => {
                console.error('Petition failed to post', error.response)
                setErrorFlag(true);
                setErrorMessage(error.response.data.error || "Failed to register")
            }
        )
    }

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        const {
            target: { value },
        } = event;
        const selectedNumber = Number(value);
        setSelectedCategory(selectedNumber);
    };
    

    function PortraitIcon(props: SvgIconProps) {
        return (
          <SvgIcon {...props}>
            <path d="M12 12.25c1.24 0 2.25-1.01 2.25-2.25S13.24 7.75 12 7.75 9.75 8.76 9.75 10s1.01 2.25 2.25 2.25m4.5 4c0-1.5-3-2.25-4.5-2.25s-4.5.75-4.5 2.25V17h9zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14z" />
          </SvgIcon>
        );
    }

    return (
        <div>
            <div>
                <h2> Create your own petition </h2>
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
                    id="outlined-title"
                    label="Title"
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
                                style={getStyles(category.name, [selectedCategory?.toString() || ''], theme)}
                            >
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                </div>
                <div>
                <TextField
                    error={descriptionTouched && !!descriptionError}
                    id="outlined-description"
                    label="Description"
                    multiline
                    maxRows={10}
                    helperText={descriptionTouched ? descriptionError : ""}
                    onChange={(e) => setDescription(e.target.value)}
                        onBlur={() => {
                            setDescriptionTouched(true);
                            validateDescription();
                        }}
                    />
                </div>
                <div>
                    <h6> Add your petitiion image: </h6>
                    <Stack alignItems="center">
                        <PortraitIcon sx={{ color: pink[200], fontSize: 60 }} />
                    </Stack>
                </div>
                <Button type="submit" variant="outlined">Sumbit</Button>
                </Box>
            </div>
        </div>
    )
}

export default Create;