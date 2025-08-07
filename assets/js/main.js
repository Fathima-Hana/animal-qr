// Shared database operations
const goatDB = {
  getGoat: function (tagId) {
    const animals = JSON.parse(localStorage.getItem("animals") || "{}");
    return animals[tagId] || null;
  },

  saveGoat: function (goatData) {
    const animals = JSON.parse(localStorage.getItem("animals") || "{}");
    animals[goatData.tagId] = goatData;
    localStorage.setItem("animals", JSON.stringify(animals));
    return goatData;
  },

  deleteGoat: function (tagId) {
    const animals = JSON.parse(localStorage.getItem("animals") || "{}");
    delete animals[tagId];
    localStorage.setItem("animals", JSON.stringify(animals));
  },

  getAllGoats: function () {
    return JSON.parse(localStorage.getItem("animals") || "{}");
  },
};

// Shared utility functions
function generateTagId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900); // 100-999
  return `GT-${year}-${randomNum}`;
}

function calculateAge(dob) {
  if (!dob) return "N/A";

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age + " years";
}

// Camera scanner functions
function initScanner(videoElement, onScanSuccess) {
  return new QrScanner(videoElement, (result) => onScanSuccess(result), {
    preferredCamera: "environment",
    highlightScanRegion: true,
    highlightCodeOutline: true,
    maxScansPerSecond: 5,
  });
}

function generateQRCode(elementId, tagId) {
  const qrCodeElement = document.getElementById(elementId);
  qrCodeElement.innerHTML = "";

  QRCode.toCanvas(
    qrCodeElement,
    tagId,
    {
      width: 200,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    },
    function (error) {
      if (error) console.error(error);
    }
  );
}

function downloadQRCode(elementId, fileName) {
  const canvas = document.querySelector(`#${elementId} canvas`);
  if (canvas) {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}

// Shared image upload handling
function setupImageUpload(
  inputId,
  previewId,
  placeholderId,
  removeBtnId,
  fileInfoId
) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const placeholder = document.getElementById(placeholderId);
  const removeBtn = document.getElementById(removeBtnId);
  const fileInfo = document.getElementById(fileInfoId);
  const previewContainer = preview.parentElement;

  input.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        alert("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
        placeholder.style.display = "none";
        previewContainer.classList.add("has-image");
        removeBtn.style.display = "flex";
        fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(
          1
        )}KB)`;
      };
      reader.readAsDataURL(file);
    }
  });

  removeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    input.value = "";
    preview.src = "";
    preview.style.display = "none";
    placeholder.style.display = "block";
    previewContainer.classList.remove("has-image");
    removeBtn.style.display = "none";
    fileInfo.textContent = "No file selected";
  });

  // Drag and drop functionality
  previewContainer.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.style.borderColor = "var(--accent-color)";
    this.style.backgroundColor = "#e9f5e9";
  });

  previewContainer.addEventListener("dragleave", function (e) {
    e.preventDefault();
    this.style.borderColor = this.classList.contains("has-image")
      ? "var(--primary-color)"
      : "#ced4da";
    this.style.backgroundColor = this.classList.contains("has-image")
      ? "#f8f9fa"
      : "#f8f9fa";
  });

  previewContainer.addEventListener("drop", function (e) {
    e.preventDefault();
    this.style.borderColor = this.classList.contains("has-image")
      ? "var(--primary-color)"
      : "#ced4da";
    this.style.backgroundColor = this.classList.contains("has-image")
      ? "#f8f9fa"
      : "#f8f9fa";

    if (e.dataTransfer.files.length > 0) {
      input.files = e.dataTransfer.files;
      const event = new Event("change");
      input.dispatchEvent(event);
    }
  });
}
