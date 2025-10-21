import multer from 'multer';

const storage = multer.diskStorage(
  {
    destination: function(req,file,cb){
        return cb(null, './public/temp/')
    },
    filename: function(req,file,cb){
      return cb(null, `${ Date.now() }-${ file.originalname }`);
    },
  }
)

export const upload = multer({storage: storage});

/*
1.here we are doing custom storage configuration of multer
2.instead of simple one:
3.const upload = multer({ dest: './uploads/temp/' }); 
4.multer ke andar 3-4 options de saktey hai: first type waley ye hai:  dest or storage
 */