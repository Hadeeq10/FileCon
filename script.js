const formats = {
    document: {
        input: ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'pages'],
        output: ['pdf', 'docx', 'txt', 'rtf', 'odt', 'html']
    },
    image: {
        input: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'],
        output: ['jpg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg']
    },
    video: {
        input: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'],
        output: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'gif']
    },
    audio: {
        input: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'],
        output: ['mp3', 'wav', 'flac', 'aac', 'ogg']
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
let conversionData = null;
let currentConversionType = 'document';

const API_BASE = window.location.origin;

// Initialize UI
updateFormatOptions();

// Event listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
fileRemove.addEventListener('click', resetConverter);
convertBtn.addEventListener('click', convertFile);

// Theme toggle
document.getElementById('themeSwitch').addEventListener('change', (e) => {
  document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
});

conversionTypes.forEach(type => {
    type.addEventListener('click', () => {
        conversionTypes.forEach(t => t.classList.remove('active'));
        type.classList.add('active');
        currentConversionType = type.dataset.type;
        updateFormatOptions();
        hideError();
    });
});

fromFormat.addEventListener('change', updateToFormatOptions);
toFormat.addEventListener('change', checkConvertReady);

// Functions

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
}

function hideError() {
    errorMessage.style.display = 'none';
}

function resetConverter() {
    selectedFile = null;
    conversionData = null;
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
        progressContainer.style.display = 'block';
        progressFill.style.width = '20%';
        progressText.textContent = 'Reading file...';
        convertBtn.disabled = true;
        hideError();

        // Read file as base64
        const base64File = await readFileAsBase64(selectedFile);
        
        progressFill.style.width = '50%';
        progressText.textContent = 'Converting file...';

        // Call your Netlify function
        const response = await fetch(`${API_BASE}/.netlify/functions/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromFormat: fromFormat.value,
                toFormat: toFormat.value,
                filename: selectedFile.name,
                fileData: base64File
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Conversion failed');
        }

        progressFill.style.width = '100%';
        progressText.textContent = 'Conversion complete!';

        conversionData = result;

        setTimeout(() => {
            progressContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            downloadBtn.onclick = () => downloadFileFromBase64(result.data, result.filename, result.contentType);
        }, 500);
        
    } catch (error) {
        showError(error.message || 'An error occurred during conversion');
        progressContainer.style.display = 'none';
        convertBtn.disabled = false;
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result.split(',')[1]; // Remove prefix "data:*/*;base64,"
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function downloadFileFromBase64(base64Data, filename, contentType) {
    const link = document.createElement('a');
    link.href = `data:${contentType};base64,${base64Data}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
