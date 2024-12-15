const categories = [];

document.getElementById('categoryForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('categoryName').value;
    const imageFile = document.getElementById('categoryImage').files[0];
    const imageUrl = imageFile ? await fileToBase64(imageFile) : '';

    if (name) {
        const newCategory = { name, image: imageUrl, products: [] };
        categories.push(newCategory);
        updateSelectsCategoria();
        actualizarCategoriasTablas();
        this.reset();

        Swal.fire({
            toast: true,
            position: 'top-right',
            icon: 'success',
            title: `Categoría "${name}" agregada exitosamente.`,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
        });
    }
});

document.getElementById('productForm').addEventListener('submit', async function (event) {

    event.preventDefault();

    const name = document.getElementById('productName').value;
    const imageFile = document.getElementById('productImage').files[0];
    const imageUrl = imageFile ? await fileToBase64(imageFile) : '';
    const units = document.getElementById('productUnits').value;
    const price = document.getElementById('productPrice').value;
    const categoryName = document.getElementById('productCategory').value;

    if (name && units && price && categoryName) {
        const category = categories.find(cat => cat.name === categoryName);
        if (category) {
            category.products.push({ name, image: imageUrl, units, price });
            actualizarCategoriasTablas();
            this.reset();
        }
    }

    Swal.fire({
        toast: true,
        position: 'top-right',
        icon: 'success',
        title: `Producto "${name}" agregado exitosamente.`,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
    });
});

function updateSelectsCategoria() {
    const select = document.getElementById('productCategory');
    select.innerHTML = '<option value="">Seleccione una categoría</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
}


function editarCategoria(categoryIndex) {
    const category = categories[categoryIndex];

    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryImage').value = '';

    const saveButton = document.getElementById('saveCategoryChanges');
    saveButton.onclick = function () {
        const newName = document.getElementById('editCategoryName').value;
        const newImageFile = document.getElementById('editCategoryImage').files[0];

        category.name = newName;
        if (newImageFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                category.image = e.target.result;
                actualizarCategoriasTablas();
            };
            reader.readAsDataURL(newImageFile);
        } else {
            actualizarCategoriasTablas();
        }

        const modalElement = document.getElementById('editCategoryModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
    };

    const modal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    modal.show();
}

function actualizarCategoriasTablas() {
    const container = document.getElementById('categoryTables');
    container.innerHTML = '';

    categories.forEach((category, categoryIndex) => {
        const tableCard = document.createElement('div');
        tableCard.className = 'card my-3';

        const tableHeader = document.createElement('div');
        tableHeader.className = 'card-header';
        tableHeader.innerHTML = `
    <strong>${category.name}</strong>
    <img src="${category.image}" alt="${category.name}" style="height: 50px; margin-left: 10px;">
        <button class="btn btn-danger btn-sm m-2" onclick="borrarCategoria(${categoryIndex})"><i class="bi bi-x-circle"></i> Eliminar Categoria</button>
        <button class="btn btn-sm btn-warning float-end btn-sm m-2" onclick="editarCategoria(${categoryIndex})"><i class="bi bi-pencil-square"></i> Editar</button>
        <button class="btn btn-sm btn-primary float-end btn-sm m-2" onclick="moverCategoria(${categoryIndex}, -1)"><i class="bi bi-arrow-up"></i> Subir</button>
        <button class="btn btn-sm btn-primary float-end me-2 btn-sm m-2" onclick="moverCategoria(${categoryIndex}, 1)"><i class="bi bi-arrow-down"></i> Bajar</button>
        `;
        tableCard.appendChild(tableHeader);

        const tableBody = document.createElement('div');
        tableBody.className = 'card-body';

        if (category.products.length > 0) {
            const table = document.createElement('table');
            table.className = 'table table-striped';

            const thead = document.createElement('thead');
            thead.innerHTML = `
        <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Unidades por Bulto</th>
            <th>Precio por Unidad</th>
            <th>Acciones</th>
        </tr>
        `;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            category.products.forEach((product, productIndex) => {
                const row = document.createElement('tr');
                row.innerHTML = `
        <td><img src="${product.image}" alt="${product.name}" style="height: 50px;"></td>
        <td>${product.name}</td>
        <td>${product.units}</td>
        <td>$${product.price}</td>
        <td>
            <button class="btn btn-sm btn-primary m-2" onclick="moverProducto(${categoryIndex}, ${productIndex}, -1)"><i class="bi bi-arrow-up"></i> Subir</button>
            <button class="btn btn-sm btn-primary m-2" onclick="moverProducto(${categoryIndex}, ${productIndex}, 1)"><i class="bi bi-arrow-down"></i> Bajar</button>
            <button class="btn btn-sm btn-warning m-2" onclick="editarProducto(${categoryIndex}, ${productIndex})"><i class="bi bi-pencil-square"></i> Editar</button>
            <button class="btn btn-sm btn-danger m-2" onclick="borrarProducto(${categoryIndex}, ${productIndex})"><i class="bi bi-x-circle"></i> Eliminar</button>
        </td>
        `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            tableBody.appendChild(table);
        } else {
            tableBody.textContent = 'No hay productos en esta categoría.';
        }

        tableCard.appendChild(tableBody);
        container.appendChild(tableCard);
    });
}

function moverCategoria(categoryIndex, direction) {
    const newIndex = categoryIndex + direction;
    if (newIndex >= 0 && newIndex < categories.length) {
        const [category] = categories.splice(categoryIndex, 1);
        categories.splice(newIndex, 0, category);
        actualizarCategoriasTablas();
    }
}

function moverProducto(categoryIndex, productIndex, direction) {
    const category = categories[categoryIndex];
    const newIndex = productIndex + direction;
    if (newIndex >= 0 && newIndex < category.products.length) {
        const [product] = category.products.splice(productIndex, 1);
        category.products.splice(newIndex, 0, product);
        actualizarCategoriasTablas();
    }
}

function editarProducto(categoryIndex, productIndex) {
    const product = categories[categoryIndex].products[productIndex];
    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));

    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductUnits').value = product.units;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductIndex').value = productIndex;
    document.getElementById('editCategoryIndex').value = categoryIndex;

    populateEditProductCategories(categories[categoryIndex].name);
    modal.show();
}

async function guardarProducto() {
    const productName = document.getElementById('editProductName').value;
    const productUnits = document.getElementById('editProductUnits').value;
    const productPrice = document.getElementById('editProductPrice').value;
    const newCategoryName = document.getElementById('editProductCategory').value;
    const productIndex = document.getElementById('editProductIndex').value;
    const oldCategoryIndex = document.getElementById('editCategoryIndex').value;

    const oldCategory = categories[oldCategoryIndex];
    const product = oldCategory.products.splice(productIndex, 1)[0];

    const imageFile = document.getElementById('editProductImage').files[0];
    const imageUrl = imageFile ? await fileToBase64(imageFile) : product.image;

    product.name = productName;
    product.units = productUnits;
    product.price = productPrice;
    product.image = imageUrl;

    if (oldCategory.name !== newCategoryName) {
        const newCategory = categories.find(cat => cat.name === newCategoryName);
        newCategory.products.push(product);
    } else {
        oldCategory.products.splice(productIndex, 0, product);
    }

    Swal.fire({
        toast: true,
        position: 'top-right',
        icon: 'success',
        title: `Producto "${productName}" actualizadoo exitosamente.`,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
    });

    actualizarCategoriasTablas();
    bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
}

function borrarProducto(categoryIndex, productIndex) {
    const category = categories[categoryIndex];
    const productName = category.products[productIndex].name;

    Swal.fire({
        title: '¿Desea borrar este producto?',
        html: `El producto <b>${productName}</b> será eliminado de forma permanente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            category.products.splice(productIndex, 1);
            actualizarCategoriasTablas();

            Swal.fire({
                toast: true,
                position: 'top-right',
                icon: 'success',
                title: `El producto "${productName}" ha sido eliminado.`,
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true
            });
        }
    });
}

function guardarCatalogo() {
    Swal.fire({
        title: 'Guardar Catálogo',
        input: 'text',
        inputLabel: '',
        inputPlaceholder: 'Ingrese un nombre para el archivo',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Por favor, ingrese un nombre para el archivo.';
            }
            return null;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const fileName = result.value.trim();
            const json = JSON.stringify(categories, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName || 'catalogo'}.json`;
            link.click();

            Swal.fire({
                toast: true,
                position: 'top-right',
                icon: 'success',
                title: `El archivo "${fileName}.json" se ha descargado.`,
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true
            });
        }
    });
}

function borrarCategoria(categoryIndex) {

    if (categories[categoryIndex].products.length > 0) {

        Swal.fire({
            toast: true,
            position: 'top-right',
            icon: 'error',
            title: 'No se puede eliminar la categoría porque tiene productos.',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
        });
        return;
    }

    categories.splice(categoryIndex, 1);

    actualizarCategoriasTablas();
}

function cargarCatalogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = JSON.parse(e.target.result);
            categories.splice(0, categories.length, ...data);
            updateSelectsCategoria();
            actualizarCategoriasTablas();
        };
        reader.readAsText(file);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function populateEditProductCategories(selectedCategory) {
    const select = document.getElementById('editProductCategory');
    select.innerHTML = '';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;

        if (category.name === selectedCategory) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

document.getElementById('editProductForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const productIndex = document.getElementById('editProductIndex').value;
    const categoryIndex = document.getElementById('editCategoryIndex').value;
    const newCategoryName = document.getElementById('editProductCategory').value;

    const updatedProduct = {
        name: document.getElementById('editProductName').value,
        units: document.getElementById('editProductUnits').value,
        price: document.getElementById('editProductPrice').value,
        image: categories[categoryIndex].products[productIndex].image,
    };

    if (newCategoryName === categories[categoryIndex].name) {
        categories[categoryIndex].products[productIndex] = updatedProduct;
    } else {
        const newCategory = categories.find(cat => cat.name === newCategoryName);
        if (newCategory) {
            categories[categoryIndex].products.splice(productIndex, 1);
            newCategory.products.push(updatedProduct);
        }
    }

    actualizarCategoriasTablas();
    bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
});

function generarCatalogoPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 7;
    const cardWidth = 35;
    const cardHeight = 55;
    const imageWidth = 25;
    const imageHeight = 25;
    const borderWidth = 0.1;
    const cardSpacing = 4;
    let yOffset = margin;
    const titleSpacing = 5;

    const infoTitulo = "AUTOSERVICIO OSVALDO - TEL 45882456";

    function drawCategoryHeader(category) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");

        if (category.image) {
            const img = new Image();
            img.src = category.image;
            const imgX = margin;
            doc.addImage(img, 'JPEG', imgX, yOffset, imageWidth, imageHeight);
        }

        const titleX = margin + imageWidth + 5;
        doc.text(category.name, titleX, yOffset + 10);

        const pageWidth = doc.internal.pageSize.width;
        const textX = pageWidth - margin;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(infoTitulo, textX, yOffset + 10, { align: "right" });

        yOffset += Math.max(imageHeight, 15) + titleSpacing;
    }

    categories.forEach((category, categoryIndex) => {
        if (category.products.length === 0) return;

        if (categoryIndex > 0) {
            doc.addPage();
            yOffset = margin;
        }

        drawCategoryHeader(category);

        let xOffset = margin + 3;

        category.products.forEach((product) => {
            if (yOffset + cardHeight > doc.internal.pageSize.height - margin) {
                doc.addPage();
                yOffset = margin;
                xOffset = margin + 3;
                drawCategoryHeader(category);
            }

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(borderWidth);
            doc.rect(xOffset, yOffset, cardWidth, cardHeight, "FD");

            if (product.image) {
                const img = new Image();
                img.src = product.image;
                doc.addImage(img, 'JPEG', xOffset + (cardWidth - imageWidth) / 2, yOffset + 5, imageWidth, imageHeight);
            }

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            const productName = product.name;
            const lines = doc.splitTextToSize(productName, cardWidth - 10);

            let lineYOffset = yOffset + imageHeight + 10;
            lines.forEach((line, lineIndex) => {
                const lineX = xOffset + (cardWidth - doc.getTextWidth(line)) / 2;
                doc.text(line, lineX, lineYOffset + (lineIndex * 3));
            });

            const quantityText = `Unidades por bulto: ${product.units}`;
            const quantityX = xOffset + (cardWidth - doc.getTextWidth(quantityText)) / 2;
            doc.text(quantityText, quantityX, lineYOffset + (lines.length * 3) + 4);

            const priceText = `Precio: $${product.price}`;
            const priceX = xOffset + (cardWidth - doc.getTextWidth(priceText)) / 2;
            doc.text(priceText, priceX, lineYOffset + (lines.length * 3) + 8);

            xOffset += cardWidth + cardSpacing;

            if (xOffset + cardWidth > doc.internal.pageSize.width - margin) {
                xOffset = margin + 3;
                yOffset += cardHeight + cardSpacing;
            }
        });
    });

    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');
    const nombreArchivo = `Catálogo Autoservicio Osvaldo - fecha ${dia}-${mes}-${anio} - hora ${hora}:${minutos}:${segundos}.pdf`;

    Swal.fire({
        toast: true,
        position: 'top-right',
        icon: 'info',
        title: 'Descargando PDF... Espere un momento',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });

    doc.save(nombreArchivo);
}



