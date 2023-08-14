
  

  document.addEventListener('DOMContentLoaded', function () {
    const cambiarFotoButton = document.getElementById('cambiarFoto');
    const uploadForm = document.getElementById('uploadForm');
    const nuevaFotoInput = document.getElementById('nuevaFoto');
    const fotoPerfil = document.getElementById('fotoPerfil');
  
    cambiarFotoButton.addEventListener('click', function () {
      uploadForm.classList.toggle('show');
    });
  
    uploadForm.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      const formData = new FormData(uploadForm);
  
      try {
        const response = await fetch('/cambiar_foto', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          // Actualizar la foto de perfil con la nueva imagen
          const { nuevaFoto } = await response.json();
          fotoPerfil.src = nuevaFoto;
          uploadForm.classList.remove('show');
        } else {
          console.error('Error al cambiar la foto de perfil');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
      }
    });
  });
  