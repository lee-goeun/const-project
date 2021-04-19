import axios from 'axios'; 
import { 
	AUTH_USER, 
  SIGNIN_USER, 
	SIGNUP_USER
} from './types'; 

export function signinUser(dataToSubmit) { 

	const request = axios.post('/api/users/signin', dataToSubmit)
		.then(response => response.data)
	
	return { 
		type: SIGNIN_USER, 
		payload: request
	}
}

export function signupUser(dataToSubmit) { 

	const request = axios.post('/api/users/signup', dataToSubmit)
		.then(response => response.data)
	
	return { 
		type: SIGNUP_USER, 
		payload: request
	}
}

export function auth() { 
	const request = axios.get('/api/users/auth')
		.then(response => response.data)
	return { 
		type: AUTH_USER, 
		payload: request
	}
}