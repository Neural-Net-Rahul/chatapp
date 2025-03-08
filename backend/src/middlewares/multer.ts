import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req:any, file:any, cb:any) {
    cb(null, "./public");
  },
  filename: function (req:any, file:any, cb:any) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });
