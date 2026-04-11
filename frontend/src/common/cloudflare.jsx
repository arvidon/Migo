import axios from "axios"

export const uploadImage = async (img) => {
    try {
        const { data } = await axios.get(
            import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url"
        )

        const { uploadURL, imageURL } = data

        await axios.put(uploadURL, img, {
            headers: {
                "Content-Type": img.type
            }
        })

        return imageURL

    } catch (err) {
        console.log(err)
        return null
    }
}