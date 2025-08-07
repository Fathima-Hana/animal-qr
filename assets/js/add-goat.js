$(document).ready(function() {
    // Initialize image upload
    setupImageUpload(
        'formAnimalImage',
        'formImagePreview',
        'formUploadPlaceholder',
        'formRemoveImageBtn',
        'formFileInfo'
    );
    
    // Check if we're editing an existing goat
    const urlParams = new URLSearchParams(window.location.search);
    const tagId = urlParams.get('tagId');
    
    if (tagId) {
        // Edit mode
        $('#editMode').val('true');
        $('#originalTagId').val(tagId);
        $('#formTitle').text('Edit Goat Record');
        $('#submitBtnText').text('Update Goat Record');
        
        // Load goat data
        const goatData = goatDB.getGoat(tagId);
        if (goatData) {
            populateForm(goatData);
        } else {
            alert('Goat record not found');
            window.location.href = 'add-goat.html';
        }
    } else {
        // Add new mode - generate default tag ID
        $('#formTagId').val(generateTagId());
    }
    
    // Form submission handler
    $('#animalForm').submit(function(e) {
        e.preventDefault();
        saveGoat();
    });
    
    // Download QR code handler
    $('#formDownloadQR').click(function() {
        downloadQRCode('formQrCode', 'goat-qr-' + $('#formTagId').val() + '.png');
    });
    
    // Back to lookup handler
    $('#backToLookup').click(function() {
        window.location.href = 'index.html';
    });
    
    // Populate form with goat data
    function populateForm(data) {
        $('#formAnimalName').val(data.name);
        $('#formTagId').val(data.tagId);
        $('#formBreed').val(data.breed);
        $('#formGender').val(data.gender);
        $('#formDob').val(data.dob);
        $('#formColor').val(data.color);
        $('#formOwnerName').val(data.ownerName);
        $('#formOwnerContact').val(data.ownerContact);
        $('#formOwnerAddress').val(data.ownerAddress);
        $('#formHealthStatus').val(data.healthStatus);
        $('#formLastCheckup').val(data.lastCheckup);
        $('#formLastDewormed').val(data.lastDewormed);
        $('#formMedicalNotes').val(data.medicalNotes);
        $('#formSireId').val(data.sireId);
        $('#formDamId').val(data.damId);
        $('#formBreedingStatus').val(data.breedingStatus);
        $('#formLastBreeding').val(data.lastBreeding);
        $('#formCurrentLocation').val(data.currentLocation);
        $('#formHerdName').val(data.herdName);
        $('#formFeedType').val(data.feedType);
        $('#formLocationNotes').val(data.locationNotes);
        
        // Set image preview if exists
        if (data.image) {
            $('#formImagePreview').attr('src', data.image).show();
            $('#formUploadPlaceholder').hide();
            $('#formPreviewContainer').addClass('has-image');
            $('#formRemoveImageBtn').show();
            $('#formFileInfo').text('Current image');
        }
    }
    
    // Save goat function
    function saveGoat() {
        // Show loading spinner
        $('#formLoadingSpinner').show();
        
        // Collect form data
        const goatData = {
            name: $('#formAnimalName').val(),
            tagId: $('#formTagId').val(),
            breed: $('#formBreed').val(),
            gender: $('#formGender').val(),
            dob: $('#formDob').val(),
            color: $('#formColor').val(),
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
        
        // Handle image upload
        const imageFile = $('#formAnimalImage')[0].files[0];
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                goatData.image = e.target.result;
                completeSave(goatData);
            };
            reader.readAsDataURL(imageFile);
        } else if ($('#editMode').val() === 'true' && $('#formImagePreview').attr('src')) {
            goatData.image = $('#formImagePreview').attr('src');
            completeSave(goatData);
        } else {
            completeSave(goatData);
        }
    }
    
    function completeSave(goatData) {
        // If in edit mode and tag ID changed, remove old record
        if ($('#editMode').val() === 'true' && $('#originalTagId').val() !== goatData.tagId) {
            goatDB.deleteGoat($('#originalTagId').val());
        }
        
        // Save the goat
        goatDB.saveGoat(goatData);
        
        // Show success message
        $('#formLoadingSpinner').hide();
        $('#animalForm').hide();
        $('#formSuccessContainer').fadeIn();
        
        // Generate QR code
        generateQRCode('formQrCode', goatData.tagId);
    }
});