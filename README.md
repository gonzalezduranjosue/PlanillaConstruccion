# Análisis del Código Original y Migración a React

## ¿Cómo se hizo la página original?
La página que proporcionaste es una aplicación web clásica "monolítica" (todo en un archivo) que utiliza tecnologías estándar:

1.  **HTML5**: Estructura base.
2.  **CSS3**: Estilos definidos en la etiqueta `<style>`.
3.  **JavaScript Vanilla**: Lógica de negocio dentro de `<script>`.
4.  **Librerías Externas (CDN)**:
    *   `docx`: Para generar el archivo Word en el navegador sin necesidad de un servidor.
    *   `FileSaver.js`: Para forzar la descarga del archivo generado.

**Funcionamiento:** Funciona manipulando directamente el "DOM" (Document Object Model). Cuando escribes en un input, el script busca los elementos por su ID, lee sus valores, hace la multiplicación matemática y actualiza el texto HTML de los totales.

## ¿Por qué esta versión en React es mejor?
He migrado tu código a una aplicación **React** moderna por las siguientes razones:

1.  **Reactividad en tiempo real**: En lugar de leer inputs manualmente, React mantiene un "Estado" (State). Cuando el estado cambia, la interfaz y los cálculos se actualizan instantáneamente.
2.  **Escalabilidad**: El código original es difícil de mantener si crece. React divide la interfaz en componentes reutilizables.
3.  **UI/UX Profesional**: He utilizado **Tailwind CSS** para un diseño limpio, adaptable a móviles (responsive) y visualmente atractivo.
4.  **Type Safety**: El uso de **TypeScript** previene errores matemáticos comunes (como sumar texto en lugar de números).

## Características de esta versión
*   Cálculo automático de subtotales y totales generales.
*   Tablas dinámicas (puedes agregar o quitar filas de materiales/trabajo).
*   Generación de PDF/Word idéntica a tu versión original (usando la librería `docx`).
*   Barra de totales flotante para tener siempre visible el costo final.
