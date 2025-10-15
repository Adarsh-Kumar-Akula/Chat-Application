import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    // You would typically use state for form inputs in a real React application
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault(); // Prevents the default form submission behavior

        try {
            const response = await fetch("http://localhost:8000/accounts/login/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers like CSRF token if required by your backend
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            // Check if the response status is 200-299 (success)
            if (response.ok) {
                // Assuming the backend sends a JSON response on success
                const data = await response.json(); 
                console.log('Login Successful:', data);
                localStorage.setItem("loggedInUsername", username)

                // Navigate to the /chatPage component
                navigate('/chatPage');  
            } else {
                // Handle non-successful responses (e.g., 401 Unauthorized)
                const errorData = await response.json();
                console.error('Login failed:', response.status, errorData);
                alert('Login failed: ' + (errorData.message || 'Invalid credentials.'));
            }
        } catch (error) {
            // Handle network errors (e.g., server unreachable)
            console.error('Network or API error:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    };

    // Removed Django template code like {% for i in messages %} and {% csrf_token %}
    // The link "http://localhost:8000/" is left as is, but would typically be a relative path in a real app.

    return (
        <div>
            <center><h1>Login Form</h1></center>
            {/* The form action and method are handled by the onSubmit handler in React */}
            <form onSubmit={handleLogin} className={styles.form}>
                <center>
                    <div className={styles.container}>
                        
                        {/* The imgcontainer and img.avatar classes were in the CSS but not used in the HTML form. They are removed here to match the HTML structure. */}

                        <label htmlFor='username' className={styles.label}><b>Username : </b></label>
                        <input 
                            type="text" 
                            placeholder="Enter username" 
                            name="username" 
                            /* float="right" is an invalid HTML attribute and is better handled with CSS */
                            required 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.inputField}
                        /><br /> 

                        <label htmlFor='password' className={styles.label}><b>Password : </b></label>
                        <input 
                            type="password" 
                            placeholder="Enter Password" 
                            name="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.inputField}
                        /><br />

                        <button type="submit" className={styles.loginButton}><b>Login</b></button><br />    
                        Don't have account <Link to="/signup"> Signup </Link>
                    </div>
                </center>
            </form>
        </div>
    );
};

export default LoginPage;