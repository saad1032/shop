# 🛍️ TrendyWear - Clothing Shopping App

A beautiful and modern React Native shopping app for clothing stores, built with Expo Router and integrated with Strapi CMS.

## ✨ Features

- **Beautiful UI/UX**: Modern, clean design with smooth animations
- **Product Catalog**: Browse products with search and category filtering
- **Product Details**: Detailed product pages with images and reviews
- **Responsive Design**: Works on iOS, Android, and Web
- **Strapi Integration**: Full backend integration with Strapi CMS

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Strapi backend (see setup below)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shopping_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your phone

## 🛠️ Strapi Backend Setup

### 1. Install Strapi
```bash
npx create-strapi-app@latest my-shop-backend --quickstart
```

### 2. Create Content Types

#### Product Collection
- **title** (Text, Required)
- **description** (Rich Text, Required)
- **price** (Number, Required)
- **image** (Media, Single, Required)
- **category** (Relation, Many-to-One with Category)
- **size** (Enumeration: S, M, L, XL, XXL)
- **color** (Text, Required)
- **available** (Boolean, Required)

#### Category Collection
- **name** (Text, Required)
- **slug** (UID, Required)

#### Review Collection
- **rating** (Number, Required, 1-5)
- **comment** (Rich Text, Required)
- **product** (Relation, Many-to-One with Product)
- **user** (Relation, Many-to-One with User from users-permissions)

### 3. Configure Permissions
1. Go to Settings → Users & Permissions → Roles
2. Configure Public and Authenticated roles
3. Enable necessary permissions for each collection

### 4. Update API URL
In `api/api.js`, update the `BASE_URL` to match your Strapi server:
```javascript
const BASE_URL = 'http://localhost:1337'; // or your Strapi URL
```

## 📱 App Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Home screen
│   ├── explore.tsx        # Products listing
│   └── _layout.tsx        # Tab navigation
├── product-detail.tsx     # Product detail page
└── _layout.tsx            # Root layout

components/
└── ProductCard.js         # Reusable product card

api/
└── api.js                 # API service functions
```

## 🎨 Customization

### Colors
Update the color scheme in individual component styles:
- Primary: `#007AFF`
- Background: `#f8f9fa`
- Text: `#333`, `#666`, `#999`

### Images
- Replace placeholder images with your product images
- Update image URLs in the API calls
- Ensure proper image dimensions for optimal display

### Branding
- Update app name in `app.json`
- Change app icon in `assets/`
- Modify header titles and branding text

## 🔧 Configuration

### Environment Variables
Create a `.env` file for environment-specific settings:
```env
STRAPI_URL=http://localhost:1337
API_TIMEOUT=10000
```

### API Configuration
Update `api/api.js` for your specific needs:
- Change base URL
- Add authentication headers
- Configure request timeouts
- Add error handling

## 📦 Build & Deploy

### Build for Production
```bash
# iOS
expo build:ios

# Android
expo build:android

# Web
expo build:web
```

### Deploy to App Stores
1. Configure app.json with your app details
2. Build the app using EAS Build
3. Submit to App Store Connect and Google Play Console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the [Expo documentation](https://docs.expo.dev/)
2. Review [Strapi documentation](https://docs.strapi.io/)
3. Open an issue in this repository

## 🎯 Roadmap

- [ ] Shopping cart functionality
- [ ] User authentication
- [ ] Payment integration
- [ ] Push notifications
- [ ] Wishlist functionality
- [ ] Order tracking
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline support

---

Made with ❤️ for the React Native community
