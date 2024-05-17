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
    firstName: string, 
    /**
     * Users last name as entered when created
     */
    lastName: string,
    /**
     * Users image filename as entered when created
     */
    imageFilename: string, 
    /**
     * Users password as entered when created
     */
    password: string,
    /**
     * Users token as defined when logged in 
     */
    token: string
}

type UserName = {
    /**
         * Users first name as entered when created
         */ 
    firstName: string, 
    /**
     * Users last name as entered when created
     */
    lastName: string,
}