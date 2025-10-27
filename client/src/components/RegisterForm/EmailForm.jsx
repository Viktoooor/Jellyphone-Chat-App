import FormInput from "../UI/form/FormInput"
import Button from "../UI/button/Button"

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
                <Button 
                    label='Next' type='primary' full
                    onClick={nextPage} loading={loading}
                    disabled={disable || loading} submit
                />
            </div>
        </form>
    )
}

export default EmailForm