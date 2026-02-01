import express from "express";
import posts from "./posts.js";


import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// 1. Recreate __dirname because it's not available in ES Modules by default
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 2. Configure where and how to save files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // This tells files to go to 'public/images'
    cb(null, path.join(__dirname, "public/images"));
  },
  filename: (req, file, cb) => {
    // This names the file: current time + original name
    // Example: 173840123-my-pic.jpg
    cb(null, Date.now() + "-" + file.originalname);
  },
});
// 3. Create the upload tool
const upload = multer({ storage: storage });




const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.render("index.ejs", { posts: posts });
});

app.get("/create-post", (req, res) => {
  res.render("create-post.ejs");
});

// "image" here must match the name="image" in your HTML form
app.post("/submit", upload.single("image"), (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const content = req.body.content;
  const slug = title.toLowerCase().replace(/ /g, "-");
  // LOGIC: Check if file exists
  let imagePath = "/images/default.webp"; // Start with default
  
  if (req.file) {
    // If user uploaded a file, update the path
    imagePath = "/images/" + req.file.filename;
  }
  const newPost = {
    id: posts.length + 1,
    title: title,
    image: imagePath, // Use our new logical variable
    description: description,
    content: content,
    slug: slug
  };
 
  posts.push(newPost);
 
  res.redirect("/");
});

app.get("/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts.find(p => p.slug === slug);
  console.log("Requested slug:", slug); // Helpful for debuging!
  if (post) {
    res.render("post.ejs", { post: post });
  } else {
    res.status(404).send("<h1>404 - Post Not Found</h1><a href='/'>Go Home</a>");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
