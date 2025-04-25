import { fetchUserAttributes } from 'aws-amplify/auth'
import { useEffect, useState } from 'react'

async function getUserAttributes() {
    const user = await fetchUserAttributes()
    return user
}

const useUserAttributes = () => {
    const [userAttributes, setUserAttributes] = useState(null)

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const attributes = await getUserAttributes()
                setUserAttributes(attributes)
            } catch (error) {
                console.error('Failed to fetch user attributes:', error)
            }
        }
        fetchAttributes()
    }, [])

    return userAttributes
}
export default useUserAttributes
