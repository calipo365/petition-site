type Petition = {
    /**
     * Petitions id as defined by the database
     */
    id: number, 
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
    creation_date: Date, 
    /**
     * Petitions image filename as defined by the user
     */
    image_filename: string, 
    /**
     * Petitions owner id as defined by the user
     */
    owner_id: number, 
    /**
     * Petitions catergory id as defined by the user
     */
    category_id: number
}