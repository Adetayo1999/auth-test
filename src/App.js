import { useEffect, useState, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";
import "./styles.css";

const BASE_URL = "https://0qbc24.sse.codesandbox.io";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    access_token: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authState.access_token) {
      (async () => {
        try {
          setLoading(true);
          const response = await axios({
            method: "get",
            url: `${BASE_URL}/refresh-token`,
            withCredentials: true
          });
          setAuthState((prev) => ({
            ...prev,
            access_token: response.data.accessToken
          }));
        } catch (error) {
          console.log(error.response.data);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [authState]);
  return (
    <AuthContext.Provider value={[authState, setAuthState]}>
      {loading ? "Please wait" : children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const [{ access_token }] = useContext(AuthContext);

  const isAuthenticated = () => {
    if (!access_token) return false;
    let payload;
    try {
      payload = jwtDecode(access_token);
    } catch (error) {
      return false;
    }
    if (!payload || !payload.iat || !payload.exp) {
      return false;
    }
    return payload.exp > Date.now() / 1000;
  };

  return {
    isAuthenticated
  };
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // if (loading) return <p>loading</p>;

  useEffect(() => {
    if (!isAuthenticated()) navigate("/login");
  }, [isAuthenticated, navigate]);

  return isAuthenticated() ? children : "Loading";
};

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setAuthContext] = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setLoading(true);
      const data = { email, password };
      const response = await axios({
        method: "post",
        url: `${BASE_URL}/register`,
        data,
        withCredentials: "include"
      });
      setAuthContext({
        user: response.data.user,
        access_token: response.data.accessToken
      });
      navigate("/");
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <label htmlFor="Email">
        Email:
        <input
          type="text"
          placeholder="enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label htmlFor="username">
        Password:
        <input
          type="password"
          placeholder="enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleRegister}> LOGIN </button>
      {loading && "Please wait"}
    </>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setAuthContext] = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = { email, password };
      const response = await axios({
        method: "post",
        url: `${BASE_URL}/login`,
        data,
        withCredentials: "include"
      });
      setAuthContext({
        user: response.data.user,
        access_token: response.data.accessToken
      });
      navigate("/");
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <label htmlFor="Email">
        Email:
        <input
          type="text"
          placeholder="enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label htmlFor="username">
        Password:
        <input
          type="password"
          placeholder="enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleLogin}> LOGIN </button>
      {loading && "Please wait"}
    </>
  );
};

const Home = () => {
  const [authContext] = useContext(AuthContext);
  return <h1>Hello {authContext.user.email}</h1>;
};

const Nav = () => {
  return (
    <ul>
      <li>
        {" "}
        <Link to="/"> Home </Link>{" "}
      </li>
      <li>
        {" "}
        <Link to="/login"> Login </Link>{" "}
      </li>
      <li>
        {" "}
        <Link to="/register"> Register </Link>{" "}
      </li>
    </ul>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route element={<Login />} path="/login" />
          <Route element={<Signup />} path="/register" />
          <Route
            element={
              <AuthRoute>
                <Home />
              </AuthRoute>
            }
            path="/"
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
