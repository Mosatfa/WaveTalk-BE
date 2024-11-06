import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'
//set directory dirname 
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../config/.env') })
import cloudinary from 'cloudinary';


cloudinary.v2.config({
    api_key:"",
    api_secret:"",
    cloud_name:"",
    secure: true
})

export default cloudinary.v2;
