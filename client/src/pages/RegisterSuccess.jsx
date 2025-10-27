import FormFooter from "../components/UI/form/FormFooter"

const RegisterSuccess = () => {
    return (
        <main className="auth-container">
            <section className="auth-card">
                <header>
                    <img src='/favicon.ico' style={{width: '50px'}}/>
                    <h2>Register successful</h2>
                </header>
                <h3>
                    Check your email and activate your account
                </h3>
                <FormFooter 
                    text="Activated?"
                    link="/login"
                    linkText="Log in"
                />
            </section>
        </main>
    )
}

export default RegisterSuccess