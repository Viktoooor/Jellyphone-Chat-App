const compressImage = (file, maxWidth = 900, maxHeight = 900,
    maxKB = 500, quality = 1) => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = event => {
            const img = new Image()
            img.src = event.target.result

            img.onload = () => {
                let width = img.width
                let height = img.height

                if(width > maxWidth || height > maxHeight){
                    const ratio = Math.min(maxWidth / width, maxHeight / height)
                    width *= ratio
                    height *= ratio
                }

                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)

                for(; quality > 0.1; quality -= 0.1){
                    let compressedBlob = canvas.toDataURL('image/jpeg', quality)
                    // estimated size
                    let currentSizeKB = compressedBlob.length / 1024
                    if(currentSizeKB < maxKB){
                        resolve({
                            'blob': compressedBlob, 'width': width, 'height': height
                        })
                    }
                }
                let compressedBlob = canvas.toDataURL('image/jpeg', quality)
                resolve({'blob': compressedBlob, 'width': width, 'height': height})
            };
        };
    })
}

export default compressImage