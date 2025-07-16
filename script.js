// Format definitions
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
let currentConversionType = 'document';
let conversionData = null;

// API base URL - will be the current domain + /api/
const API_BASE = window.location.origin;

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
        // Show progress
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        convertBtn.disabled = true;
        progressFill.style.width = '10%';
        progressText.textContent = 'Preparing upload...';

        // Step 1: Get upload URL
        const uploadResponse = await fetch(`${API_BASE}/.netlify/functions/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'upload',
                filename: selectedFile.name,
                filesize: selectedFile.size
            })
        });

        const uploadData = await uploadResponse.json();
        
        if (!uploadData.success) {
            throw new Error(uploadData.message || 'Failed to prepare upload');
        }

        progressFill.style.width = '30%';
        progressText.textContent = 'Uploading file...';

        // Step 2: Upload file to CloudConvert
        const formData = new FormData();
        Object.entries(uploadData.uploadData).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append('file', selectedFile);

        const uploadResult = await fetch(uploadData.uploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!uploadResult.ok) {
            throw new Error('Failed to upload file');
        }

        progressFill.style.width = '50%';
        progressText.textContent = 'Starting conversion...';

        // Step 3: Start conversion
        const convertResponse = await fetch(`${API_BASE}/.netlify/functions/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'convert',
                taskId: uploadData.taskId,
                fromFormat: fromFormat.value,
                toFormat: toFormat.value,
                filename: selectedFile.name.replace(/\.[^/.]+$/, '') + '.' + toFormat.value
            })
        });

        const convertData = await convertResponse.json();
        
        if (!convertData.success) {
            throw new Error(convertData.message || 'Failed to start conversion');
        }

        progressFill.style.width = '70%';
        progressText.textContent = 'Converting file...';

        // Step 4: Poll for completion
        const conversionResult = await pollConversion(convertData.conversionId);
        
        if (!conversionResult.success) {
            throw new Error(conversionResult.message || 'Conversion failed');
        }

        progressFill.style.width = '100%';
        progressText.textContent = 'Conversion complete!';

        // Store conversion data for download
        conversionData = conversionResult;

        // Show result
        setTimeout(() => {
            progressContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            downloadBtn.onclick = () => downloadFile(conversionResult.downloadUrl, conversionResult.filename);
        }, 1000);

    } catch (error) {
        console.error('Conversion error:', error);
        showError(error.message || 'An error occurred during conversion');
        progressContainer.style.display = 'none';
        convertBtn.disabled = false;
    }
}

async function pollConversion(conversionId) {
    const maxAttempts = 30;
    const pollInterval = 2000; // 2 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const response = await fetch(`${API_BASE}/.netlify/functions/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'status',
                    conversionId: conversionId
                })
            });

            const data = await response.json();
            
            if (data.success && data.status === 'completed') {
                return data;
            } else if (data.success && data.status === 'failed') {
                throw new Error(data.message || 'Conversion failed');
            }

            // Update progress based on status
            if (data.status === 'processing') {
                const progress = Math.min(70 + (attempt * 2), 95);
                progressFill.style.width = `${progress}%`;
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        } catch (error) {
            if (attempt === maxAttempts - 1) {
                throw error;
            }
        }
    }
    
    throw new Error('Conversion timed out');
}

function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}