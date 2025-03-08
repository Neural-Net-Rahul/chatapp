import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../design/Login.css'
import axios from 'axios'
import {z} from 'zod'
import socket from "../socket";
import { INITIAL_URL } from "../constant";
import {toast} from 'react-toastify'
import { jwtDecode } from "jwt-decode";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(5, "Password must be at least 5 characters long"),
});


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    if(token){
      const { id } = jwtDecode(token) as {id:number};
      socket.connect();
      navigate(`/rooms/${id}`);
    }
  },[])

  const handleLogin = async() => {
    try{
        if(!email || !password){
            alert('All fields are required');
        }
        const data = {
          email,
          password,
        };

        const result = loginSchema.safeParse(data);
        if (!result.success) {
          alert(result.error.issues.map((issue) => issue.message).join("\n"));
          return;
        }
        toast.success("Processing...");
        const response = await axios.post(`${INITIAL_URL}/api/users/login`,{email, password});
        localStorage.setItem('token',response.data.token);
        socket.connect();
        navigate(`/rooms/${response.data.id}`);
    }
    catch(e:any){
        const status = e.response.data.status;
        if(status === 501){
            alert('User does not exist')
        }
        else if(status === 502){
            alert('Wrong password');
        }
        else{
            alert('Some error occurred');
        }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form>
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
            type="password"
            value={password}
            placeholder="minimum length : 5"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="button" onClick={ (e) => {
          e.preventDefault();
          handleLogin()}}>
          Login
        </button>
      </form>
      <p>
        Don't have an account?{" "}
        <span className="register-link" onClick={() => navigate("/register")}>
          Register
        </span>
      </p>
    </div>
  );
};

export default Login;
