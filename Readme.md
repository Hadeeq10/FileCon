# FileCave - File Conversion Application (Formerly FileCon)

A modern, user-friendly web application for converting various file formats including documents, images, videos, and audio files.

## Features

- **Multiple Format Support**: Convert between various file formats
  - Documents: PDF, DOCX, TXT, RTF, ODT, HTML
  - Images: JPG, PNG, GIF, WEBP, BMP, TIFF, SVG
  - Videos: MP4, AVI, MOV, MKV, WEBM, GIF
  - Audio: MP3, WAV, FLAC, AAC, OGG

- **User-Friendly Interface**: Clean, modern design with intuitive navigation
- **Drag & Drop**: Easy file uploading with drag and drop support
- **Real-time Progress**: Visual progress indicator during conversion
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **File Validation**: Automatic file type detection and validation
- **Secure Processing**: Files are processed securely and deleted after conversion

## Project Structure

```
FileCave/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── script.js           # Main JavaScript functionality
├── config.js           # Configuration settings
├── utils.js            # Utility functions
├── README.md           # This file
└── assets/             # Images and other assets (if any)
```

## File Descriptions

### index.html
The main HTML structure of the application including:
- Header with title and description
- Conversion type selector (Documents, Images, Videos, Audio)
- File upload area with drag-and-drop support
- Format selection dropdowns
- Progress indicators
- Results and download sections
- Feature showcase

### style.css
Contains all the styling for the application:
- Modern gradient backgrounds
- Responsive grid layouts
- Smooth animations and transitions
- Mobile-friendly responsive design
- Custom styled form elements
- Progress bar and notification styles

### script.js
Main JavaScript functionality including:
- File upload handling (drag & drop, click to browse)
- Format detection and validation
- Conversion process management
- Progress tracking and polling
- Error handling and user feedback
- Download functionality

### config.js
Configuration file containing:
- API endpoints and settings
- File type definitions and limits
- UI configuration options
- Quality settings for different formats
- Error and success messages
- Feature flags for enabling/disabling features

### utils.js
Utility functions for common operations:
- File size formatting
- File validation functions
- Debounce and throttle functions
- Notification system
- Browser detection
- Logging utilities
- Clipboard operations

## Setup Instructions

1. **Clone or Download**: Get the project files
2. **Web Server**: Serve the files through a web server (required for proper functionality)
3. **Backend Setup**: Configure the backend API endpoints in `config.js`
4. **Dependencies**: No external dependencies required - uses vanilla JavaScript

## Development Setup

### Local Development
```bash
# Using Python (Python 3)
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

### Backend Requirements
The application expects a backend API with the following endpoints:
- `POST /.netlify/functions/convert` - Handle file upload and conversion
- Support for actions: `upload`, `convert`, `status`

## Configuration

### API Configuration
Edit `config.js` to set up your API endpoints:
```javascript
API: {
    BASE_URL: 'your-api-base-url',
    ENDPOINTS: {
        CONVERT: '/.netlify/functions/convert',
        // ... other endpoints
    }
}
```

### File Settings
Adjust file size limits and supported formats in `config.js`:
```javascript
FILES: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ACCEPTED_TYPES: {
        // ... format definitions
    }
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features

### Drag & Drop
- Native HTML5 drag and drop support
- Visual feedback during drag operations
- Automatic file type detection

### Progress Tracking
- Real-time conversion progress
- Visual progress bar
- Status messages during each step

### Error Handling
- Comprehensive error messages
- Input validation
- Network error handling
- Timeout management

### Mobile Support
- Responsive design
- Touch-friendly interface
- Optimized for mobile browsers

## Customization

### Themes
The application supports theming through CSS variables. Modify the color scheme in `style.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
    /* ... other variables */
}
```

### Adding New Formats
To add support for new file formats:
1. Update the `formats` object in `script.js`
2. Add corresponding entries in `config.js`
3. Ensure backend API supports the new formats

## Security Considerations

- File size limits are enforced
- File type validation is performed
- Files are processed server-side
- No client-side file processing for security
- Automatic file cleanup after conversion

## Performance Optimization

- Debounced user interactions
- Efficient DOM manipulation
- Minimal external dependencies
- Optimized CSS animations
- Lazy loading where applicable

## Troubleshooting

### Common Issues
1. **Files not uploading**: Check file size and format restrictions
2. **Conversion fails**: Verify API endpoint configuration
3. **Progress not updating**: Check network connectivity
4. **Mobile issues**: Ensure touch events are properly handled

### Debug Mode
Enable debug mode in `config.js`:
```javascript
DEBUG: {
    ENABLED: true,
    LOG_LEVEL: 'debug'
}
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions:
- Check the troubleshooting section
- Review the configuration options
- Submit issues through the project repository


