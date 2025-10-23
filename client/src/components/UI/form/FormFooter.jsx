import { Link } from "react-router-dom"

const FormFooter = ({ text, link, linkText }) => {
    return (
        <footer>
            <p>{text} <Link to={link}>{linkText}</Link></p>
        </footer>
    )
}

export default FormFooter