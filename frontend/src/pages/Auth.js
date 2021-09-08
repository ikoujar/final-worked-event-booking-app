import React, { useRef, useState, useContext } from 'react';
import AuthContext from '../context/auth-context';

import Error from '../components/Error';

const AuthPage = (props) => {
  const [isLogin, setIsLogin] = useState(true);
  const [alert, setAlert] = useState("");
  const userNameEl = useRef(null);
  const emailEl = useRef(null);
  const passwordEl = useRef(null);
  const value = useContext(AuthContext);
  const submitHandler = event => {
    event.preventDefault();
    let username = '';
    if (!isLogin) { username = userNameEl.current.value; }
    const email = emailEl.current.value;
    const password = passwordEl.current.value;
    if ((!isLogin && username.trim().length === 0)) {
      setAlert(" خطأ في حقل اسم المستخدم!!");
      return;
    }
    if (email.trim().length === 0 || password.trim().length === 0) {
      setAlert("خطأ في حقل البريد الالكتروني أو كلمة المرور!!");
      return;
    }

    // TODO: Isn't better to move all queries to a separated file.
    let requestQuery = {
      query: `
            mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                    userId
                }
            }
        `,
      variables: {
        email,
        password,
      },
    };

    if (!isLogin) {
      requestQuery = {
        query: `
          mutation CreateUser($username: String!, $email: String!, $password: String!) {
            createUser(userInput: {username:$username, email: $email, password: $password}) {
              _id
              username
              email
            }
          }
        `,
        variables: {
          username,
          email,
          password,
        },
      };
    }
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          setAlert("حدث خطأ ما!!");
          throw new Error("faild");
        }
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors.length > 0) setAlert(resData.errors[0].message);
        if (isLogin) {
          if (resData.data.login.token) {
            // localStorage.setItem('token', resData.data.login.token);
            // localStorage.setItem('userId', resData.data.login.userId);
            value.login(
              resData.data.login.userId,
              resData.data.login.token
            );
          }
        }
        if (!isLogin && resData.data.createUser) setAlert(resData.data.createUser.username + " أضيف بنجاح!");
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <form className='auth-form' onSubmit={submitHandler}>
      <Error error={alert}/>
      {!isLogin && (
        <div className='form-control'>
          <label htmlFor='username'>اسم المستخدم</label>
          <input type='text' id='username' ref={userNameEl} />
        </div>
      )}
      <div className='form-control'>
        <label htmlFor='email'>البريد الالكتروني</label>
        <input type='email' id='email' ref={emailEl} />
      </div>
      <div className='form-control'>
        <label htmlFor='password'>كلمة المرور</label>
        <input type='password' id='password' ref={passwordEl} />
      </div>
      <div className='form-actions'>
        <button type='submit'>إرسال</button>
        <button type='button' onClick={() => { setIsLogin(!isLogin); }}>
          انتقل إلى {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
        </button>
      </div>
    </form>
  );
}

export default AuthPage;

