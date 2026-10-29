# PixelCraft Studio - School Project Website

This is a complete, responsive, one-page website designed for the fictional IT company **PixelCraft Studio** ("We craft your ideas into pixels.").

## 📁 File Structure
```
PixelCraft/
├── index.html       # Main HTML markup & structure
├── style.css        # External CSS stylesheet (brand tokens, layout, animations)
├── README.md        # Instructions and documentation
├── photo-1.jpg      # (Optional) Classmate Photo: CEO
├── photo-2.jpg      # (Optional) Classmate Photo: Human Resources Manager
├── photo-3.jpg      # (Optional) Classmate Photo: IT Manager
├── photo-4.jpg      # (Optional) Classmate Photo: Operations Manager
├── photo-5.jpg      # (Optional) Classmate Photo: Project Manager
├── photo-6.jpg      # (Optional) Classmate Photo: Web Developer
├── photo-7.jpg      # (Optional) Classmate Photo: Graphic Designer
└── photo-8.jpg      # (Optional) Classmate Photo: Marketing Manager
```

---

## 🎨 Brand Design & Color Palette
- **Purple**: `#5B2A86` (Primary brand color)
- **Orange**: `#FF8A3D` (Accent buttons and callouts)
- **Lavender**: `#FBF8FF` (Soft background and cards)
- **Dark Text**: `#2A1740` (High contrast, readable typography)
- **Typography**: Google Fonts **Poppins** with sans-serif fallback (minimum 16px body text)
- **Logo**: Pixel-art paintbrush composed of square blocks (Orange handle, light purple middle, dark purple bristles).

---

## 📑 Included Sections (In Exact Sequence)
1. **Sticky Navigation Bar** - Fixed at top with brand logo, smooth scroll navigation to all sections, and mobile hamburger drawer.
2. **Home Page** - Brand name, pixel paintbrush icon, tagline, introduction, welcome message, and orange "Contact Us" button.
3. **About Us** - Background story (IT students who love design), Vision, Mission, and 4 Key Objective Cards.
4. **Services** - 5 product & IT service cards, plus the "Who We Serve" client badges.
5. **Our Team** - Interactive Organizational Chart (CEO down to specialized roles) and 8 detailed member profile cards with circular photo frames and automatic fallbacks.
6. **Our Culture** - CRAFT Core Values in 5 colored tiles, Democratic Leadership philosophy, Diversity & Inclusion commitments, Employee Policies, and a 4-Step Conflict Resolution timeline.
7. **Optional Showcase Sections** (Extra creativity bonus):
   - **Portfolio**: 3 sample project cards (Logo, Poster, Website).
   - **Client Testimonials**: 2 fictional client reviews.
   - **News & Announcements**: 2 studio milestone updates.
   - **Careers**: 2 student-friendly job openings with interactive demo "Apply" modal.
8. **Contact Us** - Fictional contact details (email, phone, address, office hours) and a fully validated Demonstration Form with submission alert.
9. **Footer** - Logo, tagline, full section sitemap, and school project copyright disclaimer.

---

## 📸 How to Add or Swap Classmate Photos
1. Take or crop square photos of each classmate's face.
2. Rename the files exactly as:
   - `photo-1.jpg` (CEO)
   - `photo-2.jpg` (Human Resources Manager)
   - `photo-3.jpg` (IT Manager)
   - `photo-4.jpg` (Operations Manager)
   - `photo-5.jpg` (Project Manager)
   - `photo-6.jpg` (Web Developer)
   - `photo-7.jpg` (Graphic Designer)
   - `photo-8.jpg` (Marketing Manager)
3. Place them directly in the same folder as `index.html`.
4. *Note:* If a photo file is not provided or fails to load, the website automatically displays a stylish circular avatar placeholder labeled **"Photo [N]"** so the site never looks broken!

---

## ✏️ How to Replace Names and City
Open `index.html` in any text editor (VS Code, Notepad, etc.) and search for:
- `[Name 1]` to `[Name 8]` to insert your classmates' real names.
- `[Your City]` in the Contact and Footer sections to set your local city.

---

## 🚀 How to Run the Website

### Option 1: Using the Local Server (Recommended for localhost:8080)
1. Run in terminal:
   ```bash
   node server.js
   # or
   npm start
   ```
2. Open your browser and navigate to: **[http://localhost:8080](http://localhost:8080)**

### Option 2: Open Directly (No Server Needed)
Simply double-click `index.html` in File Explorer, or right-click `index.html` and choose **Open with Google Chrome** / **Microsoft Edge**.
