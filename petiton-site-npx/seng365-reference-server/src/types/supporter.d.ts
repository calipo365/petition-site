type Supporter ={
    /**
     * Supporters id as defined by the database
     */
    id: number, 
    /**
     * Supporters petition id as defined by the user
     */
    petition_id: number, 
    /**
     * Supporters support tier id as defined by the user
     */
    support_tier_id: number, 
    /**
     * Supporters user id as defined by the user
     */
    user_id: number, 
    /**
     * Supporters message as defined by the user
     */
    message: string, 
    /**
     * Supporters message post time as defined by the database
     */
    time: Date
}