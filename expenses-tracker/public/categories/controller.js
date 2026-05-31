export class CategoriesController {
    constructor(categoriesModel, categoriesView) {
        this.categoriesModel = categoriesModel;
        this.categoriesView = categoriesView;
        this.editingId = null;

        // Register event handlers with the view.
        // Needs closure over `this`.
        this.categoriesView.registerAddCategoryHandler(() => this.handleSubmit());
        this.categoriesView.registerCancelHandler(() => this.handleCancel());
        this.categoriesView.registerRemoveCategoryHandler((id) => this.handleRemoveCategory(id));
        this.categoriesView.registerEditCategoryHandler((id) => this.handleEditCategory(id));

        // Initial render
        this.updateView();
    }

    async handleSubmit() {
        if (this.editingId !== null) {
            await this.handleUpdateCategory();
        } else {
            await this.handleAddCategory();
        }
    }

    async handleAddCategory() {
        const { catName } = this.categoriesView.getInputValues();
        try {
            await this.categoriesModel.addCategory(catName);
            this.categoriesView.clearInputs();
            await this.updateView();
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    async handleUpdateCategory() {
        const { catName } = this.categoriesView.getInputValues();
        try {
            await this.categoriesModel.updateCategory(this.editingId, catName);
            this.editingId = null;
            this.categoriesView.clearInputs();
            this.categoriesView.setEditMode(false);
            await this.updateView();
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    async handleEditCategory(id) {
        try {
            const cats = await this.categoriesModel.getCategories();
            const cat = cats.find(c => c.cat_id === id);
            if (cat) {
                this.editingId = id;
                this.categoriesView.populateInputs(cat);
                this.categoriesView.setEditMode(true);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    handleCancel() {
        this.editingId = null;
        this.categoriesView.clearInputs();
        this.categoriesView.setEditMode(false);
    }

    async handleRemoveCategory(id) {
        try {
            await this.categoriesModel.removeCategory(id);
            await this.updateView();
        } catch (error) {
            alert(error.message);
        }
    }

    async updateView() {
        try {
            const cats = await this.categoriesModel.getCategories();
            this.categoriesView.renderCategories(cats);
        } catch (err) {
            alert(err);
        }
    }
}

