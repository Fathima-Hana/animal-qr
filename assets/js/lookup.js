$(document).ready(function () {
  let qrScanner = null;
  let currentFacingMode = "environment";

  // Initialize scanner when modal opens
  $("#cameraModal").on("shown.bs.modal", function () {
    const videoElem = document.getElementById("cameraVideo");
    qrScanner = initScanner(videoElem, function (result) {
      $("#animalIdInput").val(result);
      $("#cameraModal").modal("hide");
      lookupGoat(result);
    });
    qrScanner.start();
  });

  // Clean up scanner when modal closes
  $("#cameraModal").on("hidden.bs.modal", function () {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner = null;
    }
  });

  // Switch camera
  $("#switchCamera").click(function () {
    if (qrScanner) {
      currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
      qrScanner.setCamera(currentFacingMode);
    }
  });

  // Lookup button click handler
  $("#lookupBtn").click(function () {
    const animalId = $("#animalIdInput").val().trim();

    if (!animalId) {
      showError("Please enter a goat ear tag ID or scan a QR code");
      return;
    }

    lookupGoat(animalId);
  });

  // Handle Enter key in input field
  $("#animalIdInput").keypress(function (e) {
    if (e.which === 13) {
      $("#lookupBtn").click();
    }
  });

  // Function to lookup goat
  function lookupGoat(tagId) {
    $("#loadingSpinner").show();
    $("#result-container").hide();

    setTimeout(function () {
      $("#loadingSpinner").hide();

      const goatData = goatDB.getGoat(tagId);

      if (goatData) {
        showGoatDetails(goatData);
      } else {
        showError("Goat ear tag ID not found in database");
      }
    }, 500);
  }

  // Function to display goat details
  function showGoatDetails(data) {
    const html = `
            <div class="animal-profile">
                <img src="${
                  data.image || "https://via.placeholder.com/200"
                }" alt="Goat Image" class="animal-image">
                <h2 class="animal-name">${data.name}</h2>
                <div class="animal-id">Ear Tag: ${data.tagId}</div>
                <a href="add-goat.html?tagId=${
                  data.tagId
                }" class="btn btn-edit">
                    <i class="fas fa-edit me-1"></i> Edit Goat
                </a>
            </div>
            
            <div class="detail-card mb-4">
                <div class="detail-card-header">
                    <i class="fas fa-info-circle me-2"></i>Basic Information
                </div>
                <div class="detail-card-body">
                    <div class="detail-row">
                        <div class="detail-label">Tag ID:</div>
                        <div class="detail-value">${data.tagId}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Breed:</div>
                        <div class="detail-value">${data.breed}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Sex:</div>
                        <div class="detail-value">${data.gender}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Date of Birth:</div>
                        <div class="detail-value">${data.dob}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Age:</div>
                        <div class="detail-value">${calculateAge(
                          data.dob
                        )}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Color/Markings:</div>
                        <div class="detail-value">${data.color}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Owner:</div>
                        <div class="detail-value">${data.ownerName}</div>
                    </div>
                </div>
            </div>
            
            <!-- Add other sections (Health, Breeding, Location) similarly -->
        `;

    $("#result-container").html(html).fadeIn();
  }

  // Function to display error
  function showError(message) {
    $("#result-container")
      .html(
        `
            <div class="card error-card">
                <div class="card-body text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h4 class="card-title">Goat Not Found</h4>
                    <p class="card-text">${message}</p>
                    <p class="text-muted">Please check the ear tag ID and try again</p>
                </div>
            </div>
        `
      )
      .fadeIn();
  }
});
