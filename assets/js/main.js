
$(document).ready(function () {
  let qrScanner = null;
  let currentFacingMode = 'environment';

  // Navigation between sections
  $('#navLookup').click(function (e) {
    e.preventDefault();
    $('#addSection').hide();
    $('#lookupSection').show();
    $(this).addClass('active');
    $('#navAdd').removeClass('active');
  });

  $('#navAdd').click(function (e) {
    e.preventDefault();
    resetForm();
    $('#lookupSection').hide();
    $('#addSection').show();
    $(this).addClass('active');
    $('#navLookup').removeClass('active');
  });

  $('#backToLookup').click(function () {
    $('#formSuccessContainer').hide();
    $('#navLookup').click();
  });

  // Edit button handler
  $('#editGoatBtn').click(function () {
    const tagId = $('#animalTagId').text();
    editGoat(tagId);
  });

  // Lookup button click handler
  $('#lookupBtn').click(function () {
    const animalId = $('#animalIdInput').val().trim();

    if (!animalId) {
      showError('Please enter a goat ear tag ID or scan a QR code');
      return;
    }

    lookupGoat(animalId);
  });

  // Scan button click handler
  $('#scanBtn').click(function () {
    startScanner();
  });

  // Switch Camera
  $('#switchCamera').click(function () {
    stopScanner();
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    startScanner();
  });

  // Close Camera
  $('#closeCamera').click(function () {
    $('#cameraModal').modal('hide');
    stopScanner();
  });

  // Start Scanner
  function startScanner() {
    const videoElem = document.getElementById('cameraVideo');

    qrScanner = new QrScanner(
      videoElem,
      result => {
        $('#animalIdInput').val(result);
        $('#cameraModal').modal('hide');
        lookupGoat(result);
      },
      {
        preferredCamera: currentFacingMode,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5
      }
    );

    qrScanner.start();
  }

  // Stop Scanner
  function stopScanner() {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner = null;
    }
  }

  // Function to lookup goat in database
  function lookupGoat(animalId) {
    $('#loadingSpinner').show();
    $('#result-container').hide();

    // Get from localStorage
    setTimeout(function () {
      $('#loadingSpinner').hide();

      let animals = JSON.parse(localStorage.getItem('animals') || '{}');

      if (animals[animalId]) {
        showGoatDetails(animals[animalId]);
      } else {
        // Check mock database if not found in localStorage
        const mockDatabase = {
          "GT-2023-001": {
            image: "https://images.unsplash.com/photo-1583845112203-293299023c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
            name: "Daisy",
            tagId: "GT-2023-001",
            breed: "Boer",
            gender: "Female",
            dob: "March 15, 2021",
            age: "2 years",
            color: "White with brown head",
            ownerName: "John Doe",
            ownerContact: "(555) 123-4567",
            ownerAddress: "123 Farm Road, Countryside, CS 12345",
            healthStatus: "Healthy",
            lastCheckup: "May 15, 2023",
            lastDewormed: "June 5, 2023",
            vetName: "Dr. Sarah Williams",
            medicalNotes: "Healthy weight, good condition. Recommended routine deworming in 3 months.",
            vaccines: [
              { name: "CD&T", status: "current", dueDate: "2024" },
              { name: "Rabies", status: "due", dueDate: "10/2023" }
            ],
            sireId: "GT-2020-012",
            damId: "GT-2019-045",
            breedingStatus: "Not pregnant",
            lastBreeding: "N/A",
            offspringCount: "3",
            currentLocation: "Pasture 3",
            herdName: "Doe Group B",
            feedType: "Pasture + Supplemental Grain",
            locationNotes: "Prefers shade during hot afternoons"
          },
          "GT-2023-002": {
            image: "https://images.unsplash.com/photo-1551290464-66719418ca54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
            name: "Billy",
            tagId: "GT-2023-002",
            breed: "Alpine",
            gender: "Male",
            dob: "January 10, 2022",
            age: "1.5 years",
            color: "Black and white",
            ownerName: "Jane Smith",
            ownerContact: "(555) 987-6543",
            ownerAddress: "456 Ranch Road, Countryside, CS 67890",
            healthStatus: "Healthy",
            lastCheckup: "April 20, 2023",
            lastDewormed: "May 10, 2023",
            vetName: "Dr. Michael Chen",
            medicalNotes: "Excellent condition. Good breeding potential.",
            vaccines: [
              { name: "CD&T", status: "current", dueDate: "2024" },
              { name: "Rabies", status: "current", dueDate: "2025" }
            ],
            sireId: "GT-2018-078",
            damId: "GT-2019-102",
            breedingStatus: "Active breeder",
            lastBreeding: "June 1, 2023",
            offspringCount: "12",
            currentLocation: "Buck Pen A",
            herdName: "Breeding Males",
            feedType: "Grain + Hay",
            locationNotes: "Dominant male in group"
          }
        };

        if (mockDatabase[animalId]) {
          showGoatDetails(mockDatabase[animalId]);
        } else {
          showError('Goat ear tag ID not found in database');
        }
      }
    }, 500);
  }

  // Function to display goat details
  function showGoatDetails(data) {
    // Set basic information
    $('#animalImage').attr('src', data.image);
    $('#animalName').text(data.name);
    $('#animalId').text('Ear Tag: ' + data.tagId);
    $('#animalTagId').text(data.tagId);
    $('#animalBreed').text(data.breed);
    $('#animalGender').text(data.gender);
    $('#animalDob').text(data.dob);

    // Calculate age
    if (data.dob) {
      const dob = new Date(data.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      $('#animalAge').text(age + ' years');
    }

    $('#animalColor').text(data.color);
    $('#ownerName').text(data.ownerName);

    // Set health information
    const healthStatus = $('#healthStatus');
    healthStatus.removeClass('status-healthy status-warning status-critical');

    if (data.healthStatus.toLowerCase() === 'healthy') {
      healthStatus.addClass('status-healthy').text('Healthy');
    } else if (data.healthStatus.toLowerCase() === 'warning') {
      healthStatus.addClass('status-warning').text('Needs Attention');
    } else {
      healthStatus.addClass('status-critical').text('Critical');
    }

    $('#lastCheckup').text(data.lastCheckup);
    $('#lastDewormed').text(data.lastDewormed);
    $('#vetName').text(data.vetName || 'N/A');
    $('#medicalNotes').text(data.medicalNotes || 'No notes available');

    // Set vaccines
    const vaccinesContainer = $('#vaccinations');
    vaccinesContainer.empty();

    if (data.vaccines && data.vaccines.length > 0) {
      data.vaccines.forEach(vaccine => {
        let badgeClass = 'vaccine-current';
        if (vaccine.status === 'due') badgeClass = 'vaccine-due';
        if (vaccine.status === 'overdue') badgeClass = 'vaccine-overdue';

        vaccinesContainer.append(
          `<span class="vaccine-badge ${badgeClass}">${vaccine.name} (${vaccine.status === 'current' ? 'Current' : 'Due ' + vaccine.dueDate})</span>`
        );
      });
    } else {
      vaccinesContainer.append('<span class="text-muted">No vaccination records</span>');
    }

    // Set breeding information
    $('#sireId').text(data.sireId || 'N/A');
    $('#damId').text(data.damId || 'N/A');
    $('#breedingStatus').text(data.breedingStatus || 'N/A');
    $('#lastBreeding').text(data.lastBreeding || 'N/A');
    $('#offspringCount').text(data.offspringCount || '0');

    // Set location information
    $('#currentLocation').text(data.currentLocation || 'Not specified');
    $('#herdName').text(data.herdName || 'Not specified');
    $('#feedType').text(data.feedType || 'Not specified');
    $('#locationNotes').text(data.locationNotes || 'No special notes');

    // Set timestamp
    const now = new Date();
    $('#timestamp').text('Last updated: ' + now.toLocaleString());

    $('#result-container').fadeIn();

    // Scroll to results
    $('html, body').animate({
      scrollTop: $('#result-container').offset().top - 20
    }, 500);
  }

  // Function to display error
  function showError(message) {
    $('#result-container').html(`
                    <div class="card error-card">
                        <div class="card-body text-center py-5">
                            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                            <h4 class="card-title">Goat Not Found</h4>
                            <p class="card-text">${message}</p>
                            <p class="text-muted">Please check the ear tag ID and try again</p>
                        </div>
                    </div>
                `);

    const now = new Date();
    $('#timestamp').text('Last checked: ' + now.toLocaleString());

    $('#result-container').fadeIn();
  }

  // Handle Enter key in input field
  $('#animalIdInput').keypress(function (e) {
    if (e.which === 13) {
      $('#lookupBtn').click();
    }
  });

  // Form Image Upload Handling
  const formAnimalImageInput = $('#formAnimalImage');
  const formPreviewContainer = $('#formPreviewContainer');
  const formImagePreview = $('#formImagePreview');
  const formRemoveImageBtn = $('#formRemoveImageBtn');
  const formFileInfo = $('#formFileInfo');
  const formUploadPlaceholder = $('#formPreviewContainer .upload-placeholder');

  // When a new image is selected
  formAnimalImageInput.change(function () {
    const file = this.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        // Show preview
        formImagePreview.attr('src', e.target.result).show();
        formUploadPlaceholder.hide();
        formPreviewContainer.addClass('has-image');
        formRemoveImageBtn.show();

        // Update file info
        formFileInfo.text(`${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
      }

      reader.onerror = function () {
        alert('Error reading file');
      }

      reader.readAsDataURL(file);
    }
  });

  // Remove image
  formRemoveImageBtn.click(function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Reset file input
    formAnimalImageInput.val('');
    formImagePreview.attr('src', '').hide();
    formUploadPlaceholder.show();
    formPreviewContainer.removeClass('has-image');
    formRemoveImageBtn.hide();
    formFileInfo.text('No file selected');
  });

  // Drag and drop functionality
  formPreviewContainer.on('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).css('border-color', 'var(--accent-color)');
    $(this).css('background-color', '#e9f5e9');
  });

  formPreviewContainer.on('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).css('border-color', formPreviewContainer.hasClass('has-image') ? 'var(--primary-color)' : '#ced4da');
    $(this).css('background-color', formPreviewContainer.hasClass('has-image') ? '#f8f9fa' : '#f8f9fa');
  });

  formPreviewContainer.on('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).css('border-color', formPreviewContainer.hasClass('has-image') ? 'var(--primary-color)' : '#ced4da');
    $(this).css('background-color', formPreviewContainer.hasClass('has-image') ? '#f8f9fa' : '#f8f9fa');

    const files = e.originalEvent.dataTransfer.files;
    if (files.length > 0) {
      formAnimalImageInput[0].files = files;
      formAnimalImageInput.trigger('change');
    }
  });

  // Form submission handler
  $('#animalForm').submit(function (e) {
    e.preventDefault();

    // Show loading spinner
    $('#formLoadingSpinner').show();

    // Get the image file
    const imageFile = $('#formAnimalImage')[0].files[0];
    let imageData = null;

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imageData = e.target.result;
        saveGoatRecord(imageData);
      };
      reader.readAsDataURL(imageFile);
    } else {
      // If in edit mode and no new image selected, keep the existing image
      if ($('#editMode').val() === 'true' && $('#animalImage').attr('src')) {
        imageData = $('#animalImage').attr('src');
      }
      saveGoatRecord(imageData);
    }
  });

  function saveGoatRecord(imageData) {
    // Collect form data
    const goatData = {
      name: $('#formAnimalName').val(),
      tagId: $('#formTagId').val(),
      breed: $('#formBreed').val(),
      gender: $('#formGender').val(),
      dob: $('#formDob').val(),
      color: $('#formColor').val(),
      image: imageData,
      ownerName: $('#formOwnerName').val(),
      ownerContact: $('#formOwnerContact').val(),
      ownerAddress: $('#formOwnerAddress').val(),
      healthStatus: $('#formHealthStatus').val(),
      lastCheckup: $('#formLastCheckup').val(),
      lastDewormed: $('#formLastDewormed').val(),
      medicalNotes: $('#formMedicalNotes').val(),
      sireId: $('#formSireId').val(),
      damId: $('#formDamId').val(),
      breedingStatus: $('#formBreedingStatus').val(),
      lastBreeding: $('#formLastBreeding').val(),
      currentLocation: $('#formCurrentLocation').val(),
      herdName: $('#formHerdName').val(),
      feedType: $('#formFeedType').val(),
      locationNotes: $('#formLocationNotes').val(),
      timestamp: new Date().toISOString()
    };

    // Simulate API call with timeout
    setTimeout(function () {
      $('#formLoadingSpinner').hide();

      // Store in localStorage
      let animals = JSON.parse(localStorage.getItem('animals') || '{}');

      // If in edit mode and tag ID changed, remove old record
      if ($('#editMode').val() === 'true' && $('#originalTagId').val() !== goatData.tagId) {
        delete animals[$('#originalTagId').val()];
      }

      animals[goatData.tagId] = goatData;
      localStorage.setItem('animals', JSON.stringify(animals));

      // Generate QR code
      generateQRCode(goatData.tagId);

      // Show success message and QR code
      $('#animalForm').hide();
      $('#formSuccessContainer').fadeIn();

      // Scroll to QR code
      $('html, body').animate({
        scrollTop: $('#formSuccessContainer').offset().top - 20
      }, 500);
    }, 1000);
  }

  // Generate QR code
  function generateQRCode(tagId) {
    const qrCodeElement = document.getElementById('formQrCode');
    qrCodeElement.innerHTML = ''; // Clear previous QR code

    QRCode.toCanvas(qrCodeElement, tagId, {
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, function (error) {
      if (error) console.error(error);
    });
  }

  // Download QR code
  $('#formDownloadQR').click(function () {
    const canvas = document.querySelector('#formQrCode canvas');
    const link = document.createElement('a');
    link.download = 'goat-qr-' + $('#formTagId').val() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Generate default tag ID if empty
  $('#formTagId').on('blur', function () {
    if (!$(this).val() && $('#editMode').val() === 'false') {
      // Generate a random tag ID (GT-YYYY-NNN)
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100 + Math.random() * 900); // 100-999
      $(this).val('GT-' + year + '-' + randomNum);
    }
  });

  // Edit goat function
  function editGoat(tagId) {
    // Switch to add section
    $('#navAdd').click();

    // Set form to edit mode
    $('#editMode').val('true');
    $('#originalTagId').val(tagId);
    $('#formTitle').text('Edit Goat Record');
    $('#submitBtnText').text('Update Goat Record');

    // Get goat data
    let animals = JSON.parse(localStorage.getItem('animals') || '{}');
    const goatData = animals[tagId];

    if (!goatData) {
      alert('Goat data not found for editing');
      return;
    }

    // Fill form with existing data
    $('#formAnimalName').val(goatData.name);
    $('#formTagId').val(goatData.tagId);
    $('#formBreed').val(goatData.breed);
    $('#formGender').val(goatData.gender);
    $('#formDob').val(goatData.dob);
    $('#formColor').val(goatData.color);
    $('#formOwnerName').val(goatData.ownerName);
    $('#formOwnerContact').val(goatData.ownerContact);
    $('#formOwnerAddress').val(goatData.ownerAddress);
    $('#formHealthStatus').val(goatData.healthStatus);
    $('#formLastCheckup').val(goatData.lastCheckup);
    $('#formLastDewormed').val(goatData.lastDewormed);
    $('#formMedicalNotes').val(goatData.medicalNotes);
    $('#formSireId').val(goatData.sireId);
    $('#formDamId').val(goatData.damId);
    $('#formBreedingStatus').val(goatData.breedingStatus);
    $('#formLastBreeding').val(goatData.lastBreeding);
    $('#formCurrentLocation').val(goatData.currentLocation);
    $('#formHerdName').val(goatData.herdName);
    $('#formFeedType').val(goatData.feedType);
    $('#formLocationNotes').val(goatData.locationNotes);

    // Set image preview if exists
    if (goatData.image) {
      formImagePreview.attr('src', goatData.image).show();
      formUploadPlaceholder.hide();
      formPreviewContainer.addClass('has-image');
      formRemoveImageBtn.show();
      formFileInfo.text('Current image');
    }
  }

  // Reset form to add new goat
  function resetForm() {
    $('#editMode').val('false');
    $('#originalTagId').val('');
    $('#formTitle').text('Add New Goat');
    $('#submitBtnText').text('Save Goat Record');
    $('#animalForm').trigger('reset');
    $('#animalForm').show();
    $('#formSuccessContainer').hide();

    // Reset image preview
    formImagePreview.attr('src', '').hide();
    formUploadPlaceholder.show();
    formPreviewContainer.removeClass('has-image');
    formRemoveImageBtn.hide();
    formFileInfo.text('No file selected');

    // Generate default tag ID
    $('#formTagId').trigger('blur');
  }
});
