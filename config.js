// Configuration file for ConvertEase application
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: window.location.origin,
        ENDPOINTS: {
            CONVERT: '/.netlify/functions/convert',
            UPLOAD: '/.netlify/functions/upload',
            STATUS: '/.netlify/functions/status'
        },
        TIMEOUT: 30000, // 30 seconds
        POLL_INTERVAL: 2000, // 2 seconds
        MAX_POLL_ATTEMPTS: 30
    },

    // File Configuration
    FILES: {
        MAX_SIZE: 100 * 1024 * 1024, // 100MB
        ACCEPTED_TYPES: {
            document: {
                extensions: ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'pages'],
                mimeTypes: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/msword',
                    'text/plain',
                    'application/rtf',
                    'application/vnd.oasis.opendocument.text'
                ]
            },
            image: {
                extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'],
                mimeTypes: [
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'image/bmp',
                    'image/tiff',
                    'image/webp',
                    'image/svg+xml'
                ]
            },
            video: {
                extensions: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'],
                mimeTypes: [
                    'video/mp4',
                    'video/avi',
                    'video/quicktime',
                    'video/x-msvideo',
                    'video/x-ms-wmv',
                    'video/x-flv',
                    'video/webm'
                ]
            },
            audio: {
                extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'],
                mimeTypes: [
                    'audio/mpeg',
                    'audio/wav',
                    'audio/flac',
                    'audio/aac',
                    'audio/ogg',
                    'audio/x-ms-wma',
                    'audio/mp4'
                ]
            }
        }
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300, // milliseconds
        PROGRESS_UPDATE_INTERVAL: 100, // milliseconds
        ERROR_DISPLAY_DURATION: 5000, // 5 seconds
        SUCCESS_DISPLAY_DURATION: 3000, // 3 seconds
        THEMES: {
            DEFAULT: 'default',
            DARK: 'dark',
            LIGHT: 'light'
        }
    },

    // Conversion Quality Settings
    QUALITY: {
        image: {
            jpeg: { quality: 85 },
            png: { compression: 6 },
            webp: { quality: 85 }
        },
        video: {
            mp4: { quality: 'medium', bitrate: '1000k' },
            webm: { quality: 'medium', bitrate: '1000k' }
        },
        audio: {
            mp3: { bitrate: '192k' },
            aac: { bitrate: '192k' },
            ogg: { bitrate: '192k' }
        }
    },

    // Error Messages
    ERRORS: {
        FILE_TOO_LARGE: 'File size exceeds the maximum limit of 100MB',
        FILE_NOT_SUPPORTED: 'File type not supported for conversion',
        SAME_FORMAT: 'Input and output formats cannot be the same',
        NO_FILE_SELECTED: 'Please select a file first',
        NO_FORMAT_SELECTED: 'Please select both input and output formats',
        UPLOAD_FAILED: 'Failed to upload file. Please try again.',
        CONVERSION_FAILED: 'File conversion failed. Please try again.',
        NETWORK_ERROR: 'Network error. Please check your connection and try again.',
        TIMEOUT_ERROR: 'Request timed out. Please try again.',
        UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
    },

    // Success Messages
    SUCCESS: {
        UPLOAD_COMPLETE: 'File uploaded successfully',
        CONVERSION_COMPLETE: 'File converted successfully',
        DOWNLOAD_READY: 'Your file is ready for download'
    },

    // Feature Flags
    FEATURES: {
        DRAG_DROP: true,
        BATCH_CONVERSION: false,
        CLOUD_STORAGE: false,
        PREVIEW: true,
        HISTORY: false
    },

    // Development Settings
    DEBUG: {
        ENABLED: false,
        LOG_LEVEL: 'info', // error, warn, info, debug
        MOCK_API: false
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;