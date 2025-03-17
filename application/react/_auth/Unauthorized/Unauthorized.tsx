import { useLocation } from "react-router-dom"
import './Unauthorized.scss';

export const Unauthorized = () => {
    const location = useLocation();
    const fromUrl = location.state?.from?.pathname;

    return (
        <div>
            <h1>Unauthorized</h1>
            <p>You do not have access to the requested page ("{fromUrl}").</p>
            <p>To gain access, speak with the website administrator.</p>
        </div>
    )
}

export default Unauthorized;
