type User = {
    /**
     * User ID as defined by the database
     */
    id: number, 
    /**
     * Users email as entered when created
     */
    email: string, 
    /**
     * Users first name as entered when created
     */ 
    first_name: string, 
    /**
     * Users last name as entered when created
     */
    last_name: string,
    /**
     * Users image filename as entered when created
     */
    image_filename: string, 
    /**
     * Users password as entered when created
     */
    password: string
}