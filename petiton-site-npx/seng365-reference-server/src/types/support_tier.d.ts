type SupportTier = {
    /**
     * Support tier ID as defined by the database
     */
    id: number, 
    /**
     * Support tiers petitions id as defined by the user 
     */
    petition_id: number, 
    /**
     * Support tiers title as defined by the user
     */
    title: string, 
    /**
     * Support tiers description as defined by the user
     */
    description: string, 
    /**
     * Support tiers cost as defined by the user
     */
    cost: number
}