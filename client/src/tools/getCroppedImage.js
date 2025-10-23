const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    )

    return new Promise((resolve) => {
        // compress image
        let quality = 1
        for(; quality>0.1; quality-=0.1){
            let compressedBlob = canvas.toDataURL('image/jpeg', quality)
            // estimated size
            let currentSizeKB = compressedBlob.length / 1024

            if(currentSizeKB < 200){
                resolve(compressedBlob)
            }
        }
        resolve(canvas.toDataURL('image/jpeg', 0.1))
    })
}

export default getCroppedImg