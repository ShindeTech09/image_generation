const express = require("express");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const { Buffer } = require("buffer");
const fetch = require("node-fetch");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static("public"));

// Check for active session and redirect accordingly
// app.get("/", async (req, res) => {
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   if (session) {
//     res.redirect("/index.html");
//   } else {
//     res.redirect("/login.html");
//   }
// });

// Add a new route to check auth status
app.get("/check-auth", async (req, res) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({ error: "Failed to check authentication" });
  }
});

// Serve the signup.html file at the root URL
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Serve the login.html file at the root URL
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: name } },
    });

    if (error) {
      throw error;
    }

    res.status(200).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error signing up. Please try again." });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Email not confirmed") {
        return res.status(400).json({ error: "Email not confirmed" });
      } else {
        throw error;
      }
    }

    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    console.error("Error:", error);
    if (error.status === 400 && error.code === "invalid_credentials") {
      res.status(401).json({
        error: "Invalid login credentials. Please check your email and password.",
      });
    } else {
      res.status(500).json({ error: "Error logging in. Please try again." });
    }
  }
});

app.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Error logging out. Please try again." });
  }
});

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      } else if (response.status === 429 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw new Error(`Response status: ${response.status}`);
      }
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

app.post("/generate-pig-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetchWithRetry("https://api.imagepig.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.IMAGE_API_KEY,
      },
      body: JSON.stringify({ prompt }),
    });

    const json = await response.json();
    const buffer = Buffer.from(json.image_data, "base64");

    const filePath = path.join(__dirname, "public", "adorable-pig.jpeg");
    fs.writeFile(filePath, buffer, (error) => {
      if (error) {
        throw error;
      }
      res.json({
        message: "Image saved successfully",
        filePath: "/adorable-pig.jpeg",
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error generating pig image" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
