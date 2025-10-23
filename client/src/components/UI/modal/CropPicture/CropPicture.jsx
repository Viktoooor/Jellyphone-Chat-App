import { useState } from "react"
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const ASPECT = 1

const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth, mediaHeight
    )
}

const CropPicture = ({ imgSrc, imgRef, onComplete }) => {
    const [crop, setCrop] = useState()

    const onImageLoad = (e) => {
		const { width, height } = e.currentTarget
		setCrop(centerAspectCrop(width, height, ASPECT))
	}

    return (
        <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={onComplete}
            aspect={ASPECT}
        >
            <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
            />
        </ReactCrop>
    )
}

export default CropPicture