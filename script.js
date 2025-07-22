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
const fileList = document.getElementById('fileList');
const fileRemove = document.getElementById('fileRemove');
const addMoreFilesBtn = document.getElementById('addMoreFiles');
const fromFormat = document.getElementById('fromFormat');
const toFormat = document.getElementById('toFormat');
const convertBtn = document.getElementById('convertBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultContainer = document.getElementById('resultContainer');
const downloadLinks = document.getElementById('downloadLinks');
const errorMessage = document.getElementById('errorMessage');

let selectedFiles = [];
let currentConversionType = 'document';

// Event listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

fileInput.addEventListener('change', (e) => {
  handleFileSelection(e.target.files);
});

fileRemove.addEventListener('click', () => {
  resetConverter();
});

addMoreFilesBtn.addEventListener('click', () => {
  fileInput.click();
});

fromFormat.addEventListener('change', updateToFormatOptions);
toFormat.addEventListener('change', checkConvertReady);
convertBtn.addEventListener('click', convertFile);

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
  if (e.dataTransfer.files.length) {
    handleFileSelection(e.dataTransfer.files);
  }
}

function handleFileSelection(files) {
  for (const file of files) {
    // Avoid duplicate files
    if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
      selectedFiles.push(file);
    }
  }

  if (selectedFiles.length) {
    detectFileFormat(selectedFiles[0]);
    displayFileInfo();
    uploadArea.style.display = 'none';
    addMoreFilesBtn.style.display = 'inline-block';
    hideError();
    checkConvertReady();
  }
}

function displayFileInfo() {
  if (!selectedFiles.length) {
    fileInfo.style.display = 'none';
    return;
  }

  fileInfo.style.display = 'block';
  fileList.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const card = document.createElement('div');
    card.className = 'file-card';

    const nameP = document.createElement('p');
    nameP.textContent = file.name;

    const sizeSmall = document.createElement('small');
    sizeSmall.textContent = formatFileSize(file.size);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-single';
    removeBtn.addEventListener('click', () => {
      selectedFiles.splice(index, 1);
      if (selectedFiles.length === 0) resetConverter();
      else displayFileInfo();
      checkConvertReady();
    });

    card.appendChild(nameP);
    card.appendChild(sizeSmall);
    card.appendChild(removeBtn);

    fileList.appendChild(card);
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function detectFileFormat(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  for (const [type, typeFormats] of Object.entries(formats)) {
    if (typeFormats.input.includes(ext)) {
      currentConversionType = type;
      updateFormatOptions();
      fromFormat.value = ext;
      updateToFormatOptions();
      return;
    }
  }
  // default to document if unknown
  currentConversionType = 'document';
  updateFormatOptions();
}

function updateFormatOptions() {
  const typeFormats = formats[currentConversionType];
  fromFormat.innerHTML = '<option value="">Select input format</option>';
  toFormat.innerHTML = '<option value="">Select output format</option>';

  typeFormats.input.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = f.toUpperCase();
    fromFormat.appendChild(opt);
  });

  typeFormats.output.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = f.toUpperCase();
    toFormat.appendChild(opt);
  });
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

  checkConvertReady();
}

function checkConvertReady() {
  const ready = selectedFiles.length > 0 && fromFormat.value && toFormat.value;
  convertBtn.disabled = !ready;
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = 'block';
}

function hideError() {
  errorMessage.style.display = 'none';
}

function resetConverter() {
  selectedFiles = [];
  fileInfo.style.display = 'none';
  uploadArea.style.display = 'block';
  addMoreFilesBtn.style.display = 'none';
  fromFormat.value = '';
  toFormat.value = '';
  fileInput.value = '';
  convertBtn.disabled = true;
  resultContainer.style.display = 'none';
  downloadLinks.innerHTML = '';
  hideError();
}

async function convertFile() {
  if (!selectedFiles.length) return;

  convertBtn.disabled = true;
  progressContainer.style.display = 'block';
  progressFill.style.width = '0%';
  progressText.textContent = 'Starting conversion...';
  errorMessage.style.display = 'none';
  resultContainer.style.display = 'none';
  downloadLinks.innerHTML = '';

  try {
    // For demonstration: simulate progress and fake conversion delay
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressFill.style.width = progress + '%';
      progressText.textContent = `Converting... ${progress}%`;
      if (progress >= 100) clearInterval(interval);
    }, 200);

    await new Promise(r => setTimeout(r, 2200));

    // Normally here you'd call your API to convert the file(s)

    // Show result and download links (fake links here)
    progressText.textContent = 'Conversion Complete!';
    progressFill.style.width = '100%';
    progressContainer.style.display = 'none';

    resultContainer.style.display = 'block';

    // Show download links for each file (simulate .converted extension)
    selectedFiles.forEach(file => {
      const link = document.createElement('a');
      link.href = '#'; // Your converted file URL here
      link.textContent = `Download ${file.name} (converted)`;
      link.className = 'download-link';
      link.style.display = 'block';
      link.style.marginBottom = '0.5rem';
      downloadLinks.appendChild(link);
    });

  } catch (err) {
    showError('Error during conversion: ' + err.message);
  } finally {
    convertBtn.disabled = false;
  }
}

// Initialize
resetConverter();
