import ReactDOM from 'react-dom'

const ImageViewer = ({ src, onClose }) => {
    if(!src)
        return null

    return ReactDOM.createPortal(
        <div 
            className="dialog-backdrop" onClick={onClose}
            onContextMenu={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <img
                    src={src}
                    style={{
                        maxWidth: '80vw',
                        minHeight: '20vh', maxHeight: '80vh'
                    }}
                />
            </div>
        </div>, document.getElementById('portal-root')
    )
}

export default ImageViewer