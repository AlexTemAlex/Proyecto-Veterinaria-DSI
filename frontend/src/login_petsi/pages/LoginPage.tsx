import LoginForm from '../components/LoginForm';
import './LoginPage.css';
import loginImage from '../../assets/fonts/feather-icons/images/image-login.png';

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-image-section">
        <div className="login-frame">
          <div className="login-image-container">
            <div className="login-logo">PETSI</div>
            <img src={loginImage} alt="PetSI Veterinaria" className="login-image" />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
