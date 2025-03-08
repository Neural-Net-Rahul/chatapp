import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../design/Register.css";
import axios from "axios";
import { INITIAL_URL } from "../constant";
import {toast} from 'react-toastify'
import socket from "../socket";
import { jwtDecode } from "jwt-decode";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    if(token){
      const { id } = jwtDecode(token) as {id:number};
      socket.connect();
      navigate(`/rooms/${id}`);
    }
  },[])
  

  const handleRegister = async() => {
    try{
      const formData = new FormData();
      formData.append('username',username);
      formData.append('email',email);
      formData.append('password',password);
      if(profilePic){
        formData.append('image',profilePic);
      }
      toast.success("Processing...");
      const response = await axios.post(`${INITIAL_URL}/api/users/register`,formData);  
      localStorage.setItem('token',response.data.token);
      socket.connect();
      navigate(`/rooms/${response.data.id}`);
    }
    catch(e:any){
      if(e.response.data.status === 501){
        alert('User already exists');
        return;
      }
      alert('Some error occurred');
    }
  }

  const handleProfilePicChange = (e:any) => {
    if(e.target.files && e.target.files[0]){
      setProfilePic(e.target.files[0]);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form>
        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            placeholder="Minimum Length : 5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Profile Picture</label>
          <input type="file" accept="image/*" onChange={(e) => handleProfilePicChange(e)} />
        </div>
        <button type="button" onClick={handleRegister}>
          Register
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <span className="login-link" onClick={() => navigate("/")}>
          Login
        </span>
      </p>
    </div>
  );
};

export default Register;
