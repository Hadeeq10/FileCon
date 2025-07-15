// Updated script.js with Cloudmersive integration

// Format definitions (supported conversions)
const formats = {
    document: {
        input: ['pdf', 'docx', 'txt', 'rtf', 'html'],
        output: ['pdf', 'docx', 'txt']
    },
    image: {
        input: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'],
        output: ['jpg', 'png', 'gif', 'webp']
    },
    video: {
        input: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
        output: ['mp4', 'avi']
    },
    audio: {
        input: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
        output: ['mp3', 'wav']
    }
};

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileType = document.getElementById('fileType');
const fileRemove = document.getElementById('fileRemove');
const fromFormat = document.getElementById('fromFormat');
const toFormat = document.getElementById('toFormat');
const convertBtn = document.getElementById('convertBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultContainer = document.getElementById('resultContainer');
const downloadBtn = document.getElementById('downloadBtn');
const errorMessage = document.getElementById('errorMessage');
const conversionTypes = document.querySelectorAll('.conversion-type');

let selectedFile = null;
let currentConversionType = 'document';
let convertedFileData = null;

// Initialize
updateFormatOptions();

// Event listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
fileRemove.addEventListener('click', resetConverter);
convertBtn.addEventListener('click', convertFile);

// Conversion type selection
conversionTypes.forEach(type => {
    type.addEventListener('click', () => {
        conversionTypes.forEach(t => t.classList.remove('active'));
        type.classList.add('active');
        currentConversionType = type.dataset.type;
        updateFormatOptions();
        hideError();
    });
});

// Format change listeners
fromFormat.addEventListener('change', updateToFormatOptions);
toFormat.addEventListener('change', checkConvertReady);

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileSelection(file);
    }
}

function handleFileSelection(file) {
    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
        showError('File size exceeds 100MB limit');
        return;
    }

    selectedFile = file;
    displayFileInfo(file);
    detectFileFormat(file);
    hideError();
}

function displayFileInfo(file) {
    fileName.textContent = `Name: ${file.name}`;
    fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
    fileType.textContent = `Type: ${file.type || 'Unknown'}`;
    fileInfo.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function detectFileFormat(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    for (const [type, typeFormats] of Object.entries(formats)) {
        if (typeFormats.input.includes(extension)) {
            conversionTypes.forEach(t => t.classList.remove('active'));
            document.querySelector(`[data-type="${type}"]`).classList.add('active');
            currentConversionType = type;
            updateFormatOptions();
            
            fromFormat.value = extension;
            updateToFormatOptions();
            break;
        }
    }
}

function updateFormatOptions() {
    const typeFormats = formats[currentConversionType];
    
    fromFormat.innerHTML = '<option value="">Select input format</option>';
    toFormat.innerHTML = '<option value="">Select output format</option>';
    
    typeFormats.input.forEach(format => {
        const option = document.createElement('option');
        option.value = format;
        option.textContent = format.toUpperCase();
        fromFormat.appendChild(option);
    });
    
    typeFormats.output.forEach(format => {
        const option = document.createElement('option');
        option.value = format;
        option.textContent = format.toUpperCase();
        toFormat.appendChild(option);
    });
}

function updateToFormatOptions() {
    const selectedFrom = fromFormat.value;
    const typeFormats = formats[currentConversionType];
    
    toFormat.innerHTML = '<option value="">Select output format</option>';
    
    typeFormats.output.forEach(format => {
        if (format !== selectedFrom) {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = format.toUpperCase();
            toFormat.appendChild(option);
        }
    });
    
    checkConvertReady();
}

function checkConvertReady() {
    const ready = selectedFile && fromFormat.value && toFormat.value;
    convertBtn.disabled = !ready;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.style.display = 'none';
}

function resetConverter() {
    selectedFile = null;
    convertedFileData = null;
    fileInfo.style.display = 'none';
    progressContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    fromFormat.value = '';
    toFormat.value = '';
    fileInput.value = '';
    convertBtn.disabled = true;
    hideError();
}

async function convertFile() {
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }

    if (!fromFormat.value || !toFormat.value) {
        showError('Please select both input and output formats');
        return;
    }

    if (fromFormat.value === toFormat.value) {
        showError('Input and output formats cannot be the same');
        return;
    }

    try {
        // Show progress
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        convertBtn.disabled = true;
        updateProgress(20, 'Preparing file...');

        // Convert file to base64
        const fileData = await fileToBase64(selectedFile);
        updateProgress(40, 'Uploading file...');

        // Make conversion request
        const response = await fetch('/.netlify/functions/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromFormat: fromFormat.value,
                toFormat: toFormat.value,
                filename: selectedFile.name,
                fileData: fileData
            })
        });

        updateProgress(70, 'Processing conversion...');

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Conversion failed');
        }

        updateProgress(100, 'Conversion complete!');

        // Store converted file data
        convertedFileData = {
            data: result.data,
            filename: result.filename,
            contentType: result.contentType
        };

        // Show result after a brief delay
        setTimeout(() => {
            progressContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            convertBtn.disabled = false;
        }, 1000);

    } catch (error) {
        console.error('Conversion error:', error);
        showError(error.message || 'An error occurred during conversion');
        progressContainer.style.display = 'none';
        convertBtn.disabled = false;
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data URL prefix (data:mime/type;base64,)
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

function updateProgress(percentage, message) {
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = message;
}

// Download functionality
downloadBtn.addEventListener('click', () => {
    if (!convertedFileData) {
        showError('No converted file available');
        return;
    }

    try {
        // Convert base64 to blob
        const byteCharacters = atob(convertedFileData.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: convertedFileData.contentType });

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = convertedFileData.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download file');
    }
});

// Initialize the first conversion type as active
document.querySelector('[data-type="document"]').classList.add('active');
