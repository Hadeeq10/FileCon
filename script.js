const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileType = document.getElementById('fileType');
const fileRemove = document.getElementById('fileRemove');
const addMoreFiles = document.getElementById('addMoreFiles');
const fromFormat = document.getElementById('fromFormat');
const toFormat = document.getElementById('toFormat');
const convertBtn = document.getElementById('convertBtn');
const resultContainer = document.getElementById('resultContainer');
const errorMessage = document.getElementById('errorMessage');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

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
  },
  other: {
    input: ['zip', 'rar', '7z', 'ova', 'html'],
    output: ['zip', 'html']
  }
};

let selectedFile = null;

uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile = file;
    displayFileInfo(file);
    uploadArea.style.display = 'none';
    addMoreFiles.style.display = 'block';
    detectFileFormat(file);
  }
});

addMoreFiles.addEventListener('click', () => fileInput.click());

fileRemove.addEventListener('click', () => {
  selectedFile = null;
  fileInfo.style.display = 'none';
  uploadArea.style.display = 'block';
  addMoreFiles.style.display = 'none';
  convertBtn.disabled = true;
  fileInput.value = '';
});

fromFormat.addEventListener('change', updateToFormatOptions);
toFormat.addEventListener('change', () => {
  convertBtn.disabled = !(selectedFile && fromFormat.value && toFormat.value);
});

convertBtn.addEventListener('click', convertFile); // ✅ connect button

function displayFileInfo(file) {
  fileInfo.style.display = 'block';
  fileName.textContent = `Name: ${file.name}`;
  fileSize.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
  fileType.textContent = `Type: ${file.type || 'Unknown'}`;
}

function detectFileFormat(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  let category = Object.keys(formats).find(cat => formats[cat].input.includes(ext)) || 'document';
  const typeFormats = formats[category];

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

  fromFormat.value = ext;
  updateToFormatOptions();
}

function updateToFormatOptions() {
  const from = fromFormat.value;
  const toOptions = toFormat.querySelectorAll('option');
  toOptions.forEach(opt => {
    opt.disabled = opt.value === from;
  });
  convertBtn.disabled = !(selectedFile && fromFormat.value && toFormat.value);
}

async function convertFile() {
  if (!selectedFile) return;

  progressBar.style.display = 'block';
  progressFill.style.width = '0%';
  progressFill.textContent = '0%';

  const base64 = await readFileAsBase64(selectedFile);

  progressFill.style.width = '30%';
  progressFill.textContent = '30%';

  const response = await fetch('/.netlify/functions/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromFormat: fromFormat.value,
      toFormat: toFormat.value,
      files: [{
        filename: selectedFile.name,
        fileData: base64
      }]
    })
  });

  progressFill.style.width = '70%';
  progressFill.textContent = '70%';

  const result = await response.json();

  if (!response.ok || !result.results) {
    errorMessage.textContent = result.error || 'Conversion failed';
    errorMessage.style.display = 'block';
    progressBar.style.display = 'none';
    return;
  }

  resultContainer.innerHTML = '';
  result.results.forEach(file => {
    const fileCard = document.createElement('div');
    fileCard.className = 'file-result';

    const nameText = document.createElement('span');
    nameText.textContent = file.filename;
    nameText.className = 'file-result-name';

    const downloadBtn = document.createElement('a');
    downloadBtn.href = '#';
    downloadBtn.textContent = '⬇ Download';
    downloadBtn.className = 'file-result-download';
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const blob = b64toBlob(file.content);
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.download = file.filename;
      tempLink.click();
      URL.revokeObjectURL(url);
    });

    fileCard.appendChild(nameText);
    fileCard.appendChild(downloadBtn);
    resultContainer.appendChild(fileCard);
  });

  progressFill.style.width = '100%';
  progressFill.textContent = '100%';

  setTimeout(() => {
    progressBar.style.display = 'none';
    progressFill.style.width = '0%';
    progressFill.textContent = '';
  }, 1000);

  resultContainer.style.display = 'block';
}

function readFileAsBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(',')[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

function b64toBlob(base64Data, contentType = 'application/octet-stream') {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length).fill().map((_, i) => slice.charCodeAt(i));
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}
