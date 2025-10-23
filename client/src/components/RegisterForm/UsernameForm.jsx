import FormInput from "../UI/form/FormInput";
import { FiArrowLeftCircle } from "react-icons/fi";

const UsernameForm = ({value, handleChange, prevPage, nextPage, error, disable, loading }) => {
    return (
        <form>
            <FormInput 
                type="text" placeholder="Username" value={value.username}
                handle="username" handleChange={handleChange} error={error}
            />
            <span className="username-hint">
                You can use letters from a-z, digits 0-9 and underscore.
                Length must be between 3 and 32 characters
            </span>
            <FormInput 
                type="text" placeholder="First Name" value={value.firstname}
                handle="firstname" handleChange={handleChange} error={error}
            />
            <div className={`error-message ${(error.length == 0) ? 'not-visible' : ''}`}>
                <span>{error}</span>
            </div>
            <div className="next-prev-buttons">
                <button type="button" className="btn left" onClick={prevPage}>
                    <FiArrowLeftCircle size={20}/>
                </button>
                <button 
                    type="button" className={`btn ${loading ? 'loading' : ''}`}
                    onClick={nextPage} disabled={disable || loading}
                >
                    <span>Next</span>
                </button>
            </div>
        </form>
    )
}

export default UsernameForm;