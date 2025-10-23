import ReactDOM from 'react-dom'
import Button from '../button/Button'

const Modal = ({ header, children, onClose, onBackropClick,
    submitLabel, onSubmit, loading }) => {
    return ReactDOM.createPortal(
        <div className="dialog-backdrop" onClick={onBackropClick}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-header">
                    <h2>{header}</h2>
                </div>
                {children}
                <div className="dialog-footer">
                    <Button
                        label={'Cancel'} type='secondary'
                        onClick={onClose}
                    />
                    <Button
                        label={submitLabel} type='primary'
                        onClick={onSubmit} disabled={loading}
                        loading={loading}
                    />
                </div>
            </div>
        </div>, document.getElementById('portal-root')
    )
}

export default Modal