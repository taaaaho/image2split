import React from 'react'
import { Center, Spinner } from '@chakra-ui/react'

const Loading = () => {
	return (
		<Center h="50vh" w="100%">
			<Spinner />
		</Center>
	)
}

export default Loading
