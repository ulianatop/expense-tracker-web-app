export class CategoriesView {
    constructor() {
        this.catNameInput = document.querySelector('#catName');
        this.catList = document.querySelector('#catList');
        this.addButton = document.querySelector('#addButton');
        this.cancelButton = document.querySelector('#cancelButton');
    }

    renderCategories(cats) {
        if (cats.length === 0) {
            this.catList.innerHTML = '<p>No categories yet.</p>';
            return;
        }

        const rows = cats.map((cat) => `
            <tr>
                <td>${cat.cat_name}</td>
                <td>
                    <button class="edit-btn" data-id="${cat.cat_id}">Edit</button>
                    <button class="remove-btn" data-id="${cat.cat_id}">Remove</button>
                </td>
            </tr>
        `).join('');

        this.catList.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    getInputValues() {
        return {
            catName: this.catNameInput.value
        };
    }

    clearInputs() {
        this.catNameInput.value = '';
    }

    populateInputs(cat) {
        this.catNameInput.value = cat.cat_name;
    }

    setEditMode(editing) {
        this.addButton.textContent = editing ? 'Update Category' : 'Add Category';
        this.cancelButton.style.display = editing ? 'inline' : 'none';
    }

    registerAddCategoryHandler(handler) {
        this.addButton.addEventListener('click', handler);
    }

    registerCancelHandler(handler) {
        this.cancelButton.addEventListener('click', handler);
    }

    registerRemoveCategoryHandler(handler) {
        this.catList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-btn')) {
                const id = parseInt(event.target.dataset.id);
                handler(id);
            }
        });
    }

    registerEditCategoryHandler(handler) {
        this.catList.addEventListener('click', (event) => {
            if (event.target.classList.contains('edit-btn')) {
                const id = parseInt(event.target.dataset.id);
                handler(id);
            }
        });
    }
}
