import os

def create_vendorhub_structure():
    # Root directory name
    base_path = "vendor-hub"

    # Define the folders and files structure
    # Keys are folder paths, values are lists of files within those folders
    structure = {
        "": ["index.html"],
        "assets/css": ["style.css", "auth.css", "dashboard.css", "components.css"],
        "assets/images": [],
        "assets/js/config": ["firebase-config.js", "gemini-config.js"],
        "assets/js/modules": [
            "auth.js", "products.js", "orders.js", 
            "vendor.js", "admin.js", "ai-service.js", "cart.js"
        ],
        "assets/js/utils": ["helpers.js", "ui-render.js"],
        "assets/js": ["main.js", "buyer-app.js", "seller-app.js", "admin-app.js"],
        "pages/auth": ["login.html", "register.html"],
        "pages/buyer": ["shop.html", "product-details.html", "cart.html", "track-order.html"],
        "pages/seller": ["dashboard.html", "add-product.html", "inventory.html"],
        "pages/admin": ["dashboard.html", "vendor-requests.html", "analytics.html"],
    }

    print(f"🚀 Creating project structure in: {os.path.abspath(base_path)}")

    for folder, files in structure.items():
        # Create directory path
        dir_path = os.path.join(base_path, folder)
        os.makedirs(dir_path, exist_ok=True)
        
        # Create files in the directory
        for file_name in files:
            file_path = os.path.join(dir_path, file_name)
            if not os.path.exists(file_path):
                with open(file_path, "w") as f:
                    # Optional: Add a basic comment to JS files
                    if file_name.endswith(".js"):
                        f.write(f"// {file_name} logic\n")
                    elif file_name.endswith(".html"):
                        f.write(f"\n")
                print(f"  ✅ Created: {file_path}")
            else:
                print(f"  ⚠️  Skipped (exists): {file_path}")

    print("\n✨ Project structure successfully generated!")

if __name__ == "__main__":
    create_vendorhub_structure()