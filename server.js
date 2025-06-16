const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/upload", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const uploadedFile = req.files.file;
  const uploadPath = path.join(__dirname, "uploads", uploadedFile.name);

  uploadedFile.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ error: "File upload failed." });
    }

    const fileUrl = `/uploads/${uploadedFile.name}`;
    res.json({ url: fileUrl });
  });
});

app.get("/", (req, res) => {
  res.send("🚀 File Sharing Backend is Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
