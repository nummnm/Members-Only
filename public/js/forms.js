document.querySelectorAll("[data-empty-until-focus]").forEach((input) => {
  const unlock = () => {
    if (input.readOnly) {
      input.value = "";
      input.readOnly = false;
    }
  };

  input.addEventListener("pointerdown", unlock, { once: true });
  input.addEventListener("focus", unlock, { once: true });
});

const profileIconInput = document.querySelector("#profile-icon");
if (profileIconInput) {
  const profileIconForm = document.querySelector("#profile-icon-form");
  const profileIconStatus = document.querySelector("#profile-icon-status");
  const uploadButton = profileIconForm.querySelector("button[type=submit]");

  profileIconInput.addEventListener("change", () => {
    const selectedFile = profileIconInput.files[0];
    uploadButton.disabled = !selectedFile;
    profileIconStatus.textContent = selectedFile
      ? `Done: ${selectedFile.name}`
      : "No picture selected";
    profileIconStatus.classList.toggle("is-selected", Boolean(selectedFile));
  });
}
