<script setup>
import { ref } from 'vue';
import { generarPdf } from '@/utils/pdf_generator.js'; // Ajusta la ruta si es necesario

// Referencia para almacenar la URL del Blob
const pdfPreview = ref(null);

const generarVistaPrevia = () => {
  // Puedes ajustar los valores que pasas a la función:
  const doc = generarPdf({
    nombreCompleto: "Juan Perez Gamora",
    pais: "Ecuador",
    telefono: "+51 956585246",
    email: "maria@gmail.com",
    columnas: ["Fecha", "Transacción", "Operación", "Monto", "Estado"],
    filas: [
      ["01/01/2025", "A1B2C3D4", "Depósito", "$ 1200,00", "Aprobado"],
      ["05/03/2024", "E5F6G7H8", "Retiro", "$ 450,00", "Pendiente"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
      ["12/07/2023", "I9J0K1L2", "Transferencia", "$ 800,00", "Rechazado"],
    ],
  });

  // Convertir el PDF a Blob para previsualizar
  const pdfBlob = doc.output('blob');
  pdfPreview.value = URL.createObjectURL(pdfBlob);
};

const handleDescargar = () => {
  if (pdfPreview.value) {
    const link = document.createElement('a');
    link.href = pdfPreview.value;
    link.download = 'reporte.pdf';
    link.click();
  }
};
</script>

<template>
  <div style="text-align: center; margin-top: 50px;">
    <button
        @click="generarVistaPrevia"
        class="bg-white text-colorTextBlack p-2 rounded-full m-2"
    >
      Previsualizar PDF
    </button>

    <button
        @click="handleDescargar"
        class="bg-blue-500 text-white p-2 rounded-full m-2"
        :disabled="!pdfPreview"
    >
      Descargar PDF
    </button>

    <!-- Contenedor para la vista previa del PDF -->
    <div v-if="pdfPreview" class="mt-4 w-full">
      <iframe
          :src="pdfPreview"
          height="600"
          frameborder="0"
          class="border rounded w-full"
      >
      </iframe>
    </div>
  </div>
</template>
