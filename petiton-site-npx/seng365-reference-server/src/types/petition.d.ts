type Petition = {
    /**
     * Petitions id as defined by the database
     */
    petitionId: number, 
    /**
     * Petitions title as defined by the user
     */
    title: string, 
    /**
     * Petitions description as defined by the user
     */ 
    description: string, 
    /**
     * Petitions creation date as defined by the database
     */
    creationDate: Date, 
    /**
     * Petitions image filename as defined by the user
     */
    image_filename: string, 
    /**
     * Petitions owner first name as defined by the user
     */
    ownerFirstName: string,
    /**
     * Petitions owner last name as defined by the user
     */
    ownerLastName: string, 
    /**
     * Petitions catergory id as defined by the user
     */
    categoryId: number
}