import multer from "multer";

//diskstorage stores the file on disk
//takes 2 options destination and filename
const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb('./public/temp/')
  },
  filename: function(req,file,cb){
    cb(file.originalname + Date.now())
  }
})

export const upload = multer({storage});