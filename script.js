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
        input: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'ova'],
        output: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'gif', 'ova']
    },
    audio: {
        input: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'],
        output: ['mp3', 'wav', 'flac', 'aac', 'ogg']
    },
    other: {
        input: ['zip', 'rar', '7z', 'html'],
        output: ['zip', 'html']
    }
};

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileList = document.getElementById('fileList');  // changed from single file info to list
const fileRemove = document.getElementById('fileRemove');
const addMoreFiles = document.getElementById('addMoreFiles');
const fromFormat = document.getElementById('fromFormat');
const toFormat = document.getElementById('toFormat');
const convertBtn = document.getElementById('convertBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultContainer = document.getElementById('resultContainer');
const errorMessage = document.getElementById('errorMessage');
const conversionTypes = document.querySelectorAll('.conversion-type');

let selectedFiles = [];
let currentConversionType = 'document';

// Initialize UI formats dropdowns
updateFormatOptions();

// Event listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
uploadArea.addEventListener('dragleave', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); });
uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) {
        handleMultipleFiles(files);
    }
});

fileInput.addEventListener('change', e => {
    if (e.target.files.length) {
        handleMultipleFiles(e.target.files);
    }
});

addMoreFiles.addEventListener('click', () => fileInput.click());

fileRemove.addEventListener('click', resetConverter);

convertBtn.addEventListener('click', convertFile);

conversionTypes.forEach(type => {
    type.addEventListener('click', () => {
        conversionTypes.forEach(t => t.classList.remove('active'));
        type.classList.add('active');
        currentConversionType = type.dataset.type;
        updateFormatOptions();
        hideError();
        resetFiles();
    });
});

fromFormat.addEventListener('change', () => {
    updateToFormatOptions();
    checkConvertReady();
});
toFormat.addEventListener('change', checkConvertReady);


// Functions

function handleMultipleFiles(files) {
    const fileArray = Array.from(files);

    // Filter files to be same type as the first selected file extension category
    if (selectedFiles.length === 0) {
        const firstExt = fileArray[0].name.split('.').pop().toLowerCase();
        const category = findCategoryByExtension(firstExt);
        if (!category) {
            showError('Unsupported file format.');
            return;
        }
        currentConversionType = category;
        conversionTypes.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-type="${category}"]`).classList.add('active');
        updateFormatOptions();
    }

    // Filter files to ensure they match currentConversionType input formats
    const allowedExts = formats[currentConversionType].input;
    const validFiles = fileArray.filter(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        return allowedExts.includes(ext);
    });

    if (validFiles.length !== fileArray.length) {
        showError(`Only ${currentConversionType} files are allowed.`);
        return;
    }

    selectedFiles = selectedFiles.concat(validFiles);
    displayFileList();
    uploadArea.style.display = 'none';
    addMoreFiles.style.display = 'inline-block';
    hideError();
    checkConvertReady();

    // Auto-detect fromFormat from first file if not set
    if (!fromFormat.value && selectedFiles.length > 0) {
        const ext = selectedFiles[0].name.split('.').pop().toLowerCase();
        fromFormat.value = ext;
        updateToFormatOptions();
    }
}

function findCategoryByExtension(ext) {
    for (const [category, obj] of Object.entries(formats)) {
        if (obj.input.includes(ext)) {
            return category;
        }
    }
    return null;
}

function displayFileList() {
    fileInfo.style.display = 'block';
    fileList.innerHTML = ''; // clear current list

    selectedFiles.forEach((file, idx) => {
        const li = document.createElement('li');
        li.textContent = `${file.name} (${formatFileSize(file.size)})`;
        fileList.appendChild(li);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateFormatOptions() {
    const typeFormats = formats[currentConversionType];

    fromFormat.innerHTML = '<option value="">Select input format</option>';
    toFormat.innerHTML = '<option value="">Select output format</option>';

    typeFormats.input.forEach(format => {
        const opt = document.createElement('option');
        opt.value = format;
        opt.textContent = format.toUpperCase();
        fromFormat.appendChild(opt);
    });

    typeFormats.output.forEach(format => {
        const opt = document.createElement('option');
        opt.value = format;
        opt.textContent = format.toUpperCase();
        toFormat.appendChild(opt);
    });

    fromFormat.value = '';
    toFormat.value = '';
}

function updateToFormatOptions() {
    const selectedFrom = fromFormat.value;
    const typeFormats = formats[currentConversionType];

    toFormat.innerHTML = '<option value="">Select output format</option>';

    typeFormats.output.forEach(format => {
        if (format !== selectedFrom) {
            const opt = document.createElement('option');
            opt.value = format;
            opt.textContent = format.toUpperCase();
            toFormat.appendChild(opt);
        }
    });
}

function checkConvertReady() {
    convertBtn.disabled = !(selectedFiles.length > 0 && fromFormat.value && toFormat.value);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function resetFiles() {
    selectedFiles = [];
    fileList.innerHTML = '';
    fileInfo.style.display = 'none';
    uploadArea.style.display = 'block';
    addMoreFiles.style.display = 'none';
    fromFormat.value = '';
    toFormat.value = '';
    convertBtn.disabled = true;
}

function resetConverter() {
    resetFiles();
    hideError();
    resultContainer.style.display = 'none';
    progressContainer.style.display = 'none';
    fileInput.value = '';
}

async function convertFile() {
    if (selectedFiles.length === 0) return;

    convertBtn.disabled = true;
    showProgress();

    try {
        const base64Files = await Promise.all(selectedFiles.map(file => readFileAsBase64(file)));
        const payloadFiles = selectedFiles.map((file, i) => ({
            filename: file.name,
            fileData: base64Files[i]
        }));

        const response = await fetch('/.netlify/functions/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fromFormat: fromFormat.value,
                toFormat: toFormat.value,
                files: payloadFiles
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Conversion failed.');

        showResults(data.results);
    } catch (error) {
        showError(error.message);
    } finally {
        hideProgress();
        convertBtn.disabled = false;
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showProgress() {
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Converting...';
}

function hideProgress() {
    progressContainer.style.display = 'none';
}

function showResults(results) {
    resultContainer.innerHTML = '';
    resultContainer.style.display = 'block';

    results.forEach(file => {
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${file.content}`;
        link.download = file.filename;
        link.textContent = `Download ${file.filename}`;
        link.className = 'download-link';
        resultContainer.appendChild(link);
    });
}
