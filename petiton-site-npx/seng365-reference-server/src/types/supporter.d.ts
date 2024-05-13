type Supporter ={
    /**
     * Supporters id as defined by the database
     */
    supportId: number, 
    /**
     * Supporters support tier id as defined by the user
     */
    supportTierId: number,
    /**
     * Supporters message as defined by the user
     */
    message: string,  
    /**
     * Supporters user id as defined by the user
     */
    supporterId: number, 
    /**
     * Supporters first name as defined by the user
     */
    supporterFirstName: string, 
    /**
     * Supporters last name as defined by the user
     */
    supporterLastName: string, 
    /**
     * Supporters message post time as defined by the database
     */
    timestamp: Date
}