import FormInput from "../UI/form/FormInput"

const EmailForm = ({ value, handleChange, nextPage, error, disable, loading }) => {
    return (
        <form onSubmit={(e) => {e.preventDefault()}}>
            <FormInput
                type="email" placeholder="Email" value={value}
                handle="email" handleChange={handleChange} error={error}
            />
            <div className={`error-message ${(error.length == 0) ? 'not-visible' : ''}`}>
                <span>{error}</span>
            </div>
            <div className="next-prev-buttons">
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

export default EmailForm