import { useRef, useState } from "react"
import { useStore } from "../../../store/store"
import { FiCamera } from "react-icons/fi"
import getCroppedImg from "../../../tools/getCroppedImage"
import CropPictureModal from "../modal/CropPicture/CropPictureModal"

const EditPicture = ({ name, src, setSelectedPicture }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [imgSrc, setImgSrc] = useState()

    const pictureRef = useRef()
    const previewImageRef = useRef()
    const pictureInputRef = useRef()
    
    const setNotification = useStore(state => state.setNotification)

    const onFileChange = async (e) => {
        if(e.target.files){
            const file = e.target.files[0]

            const reader = new FileReader();

            reader.onload = function(e){
                setImgSrc(e.target.result)
                setIsModalOpen(true)
            };

            reader.readAsDataURL(file);
        }else{
            setNotification(
                "error", 
                "Select picture"
            )
        }
    }

    const onSubmit = async (crop) => {
        const cropped = await getCroppedImg(previewImageRef.current, crop, 'any.jpeg')
        pictureRef.current.src = cropped
        setSelectedPicture(cropped)
        setIsModalOpen(false)
    }

    return (
        <div className='profile-group avatar'>
            <img 
                ref={pictureRef} className="info-avatar" alt={name} 
                src={src}
            />
            <button 
                className='default-button primary full'
                onClick={() => pictureInputRef.current.click()}
            >
                <FiCamera/>
                Change picture
                <input 
                    type='file' id={`name-${name}`} hidden ref={pictureInputRef}
                    accept='image/*' onChange={onFileChange}
                />
            </button>
            <CropPictureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imgSrc={imgSrc}
                imgRef={previewImageRef}
                onSubmit={onSubmit}
            />
        </div>
    )
}

export default EditPicture