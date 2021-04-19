import React, { useEffect } from 'react'; 
import { useDispatch } from 'react-redux'; 
import { auth } from '../_actions/user_action'; 

export default function (SpecificComponent, option, adminRoute = null) { 
  // option => null: Anyone 
  //        => true: User Only 
  //        => false: Not User
  // adminRoute => Admin Only
  function AuthenticationCheck(props) { 

    const dispatch = useDispatch(); 

    useEffect(() => { 

        dispatch(auth()).then(response => { 
          if(!response.payload.isAuth) { 
            // if not logged in
            if(option) { 
              alert('로그인 후 이용해 주세요')
              props.history.push('/signin') 
            }
          } else {  
            // if logged in 
            if(adminRoute && !response.payload.isAdmin) { 
              alert('관리자만 접근 가능합니다')
              props.history.push('/')
            }
            if (!option) { 
              alert('이미 로그인 되어 있습니다')
              props.history.push('/dashboard')
            } 
          }
        })
    }, [])
    return ( 
        <SpecificComponent />
    )
  }
  return AuthenticationCheck
}
