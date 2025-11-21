import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function BackButton({ to, label = "Volver", className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`mb-4 text-gray-400 hover:text-white flex items-center gap-2 transition-colors ${className}`}
    >
      <FiArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
}
