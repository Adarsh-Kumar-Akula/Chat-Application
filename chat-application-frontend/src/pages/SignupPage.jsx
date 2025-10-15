// src/pages/SignupPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom';
// Import the component-specific styles
import styles from './SignupPage.module.css'; 

const SignupPage = () => {
    // State management for form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const navigate = useNavigate();

    // 1. Make the function async to use await
    const handleSubmit = async (event) => {
        event.preventDefault(); 
        
        // Client-side validation for password match
        if (password !== confirmPassword) {
            alert("Error: Passwords do not match!");
            return; 
        }

        // 2. Define the data body matching the backend structure
        const signUpData = {
            username: username,
            // Note the keys are password1 and password2 as required by your backend
            password1: password, 
            password2: confirmPassword,
        };

        try {
            // 3. Make the POST request
            const response = await fetch('http://localhost:8000/accounts/signup/', {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                    // Add any other necessary headers (e.g., CSRF token if needed)
                },
                body: JSON.stringify(signUpData), // Send the data as a JSON string
            });

            console.log("response:", response);

            // 4. Handle the response
            if (response.ok) {
                // Successful sign-up (e.g., status 200-299)
                
                // Alert the user and redirect to the login page
                alert('Sign-up successful! Please log in.');
                navigate('/login'); // Redirect to the login route
                
                // Optional: clear the form state
                setUsername('');
                setPassword('');
                setConfirmPassword('');

            } else {
                // Sign-up failed (e.g., status 400, 500)
                
                // Try to get and display the error message from the backend
                const errorData = await response.json();
                
                // Show a detailed error or a generic one
                const errorMessage = errorData.error 
                    ? errorData.error 
                    : 'Sign-up failed. Please check your details and try again.';
                
                alert(errorMessage);
            }
        } catch (error) {
            // This catches network errors (e.g., server is down)
            console.error('Network error during sign-up:', error);
            alert('A network error occurred. Could not connect to the server.');
        }
    };

    return (
        // Apply the CSS class for overall component styling
        <div className={styles.signupPageBody}>
            <center>
                <h1>Register From</h1>
            </center>

            {/* Replace the HTML form with a JSX form and use onSubmit for handling */}
            <form onSubmit={handleSubmit} className={styles.form} id="signup_form" method="post">
                <center>
                    <div className={styles.container}>
                        
                        {/* User Name Field */}
                        <label htmlFor='username' className={styles.label}><b>User Name : </b></label>
                        <input 
                            type='text' 
                            placeholder="Enter username" 
                            name='username' 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.inputField}
                        /><br/>

                        {/* Password Field 
                            * IMPORTANT: Changed type to 'password' for security
                        */}
                        <label htmlFor='password' className={styles.label}><b>Password : </b></label>
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="Enter Password" 
                            name="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.inputField}
                        /><br/>
                            
                        {/* Confirm Password Field 
                            * IMPORTANT: Changed type to 'password' for security
                        */}
                        <label htmlFor='confirmPassword' className={styles.label}><b>Confirm Password : </b></label>
                        <input 
                            type="password" 
                            id="password2" 
                            placeholder="Enter Password Again" 
                            name="password2" 
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.inputField}
                        /><br/> 

                        {/* The button now triggers the form's onSubmit event */}
                        <button type="submit" className={styles.submitButton}><b>Signup</b></button><br/>    
                        
                        {/* Link to Login */}
                        Already an account <Link to="/login"> Login </Link>
                        {/* Note: In a real React app using React Router, replace <a> with <Link to="/login"> */}

                    </div>
                </center>
            </form>
        </div>
    );
};

export default SignupPage;