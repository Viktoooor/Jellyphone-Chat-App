import { useState } from 'react'
import '../style.css'
import Modal from '../Modal'
import CropPicture from './CropPicture'

const CropPictureModal = ({ isOpen, onClose, onSubmit, imgSrc, imgRef }) => {
	const [completedCrop, setCompletedCrop] = useState()

    if(!isOpen)
        return null

	return (
		<Modal 
			header='New picture' onClose={onClose}
            submitLabel='Save' onSubmit={() => onSubmit(completedCrop)}
		>
			<div className="crop-container">
				{imgSrc && (
					<CropPicture
						imgSrc={imgSrc} imgRef={imgRef}
						onComplete={(c) => setCompletedCrop(c)}
					/>
				)}
			</div>
		</Modal>
	)
}

export default CropPictureModal