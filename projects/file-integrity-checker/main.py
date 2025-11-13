import hashlib
import json
import os

HASH_FILE = "hashes.json"

# Load saved hashes from file
def load_hashes():
    if os.path.exists(HASH_FILE):
        with open(HASH_FILE, "r") as file:
            return json.load(file)
    return {}

# Save hashes to file
def save_hashes(hashes):
    with open(HASH_FILE, "w") as file:
        json.dump(hashes, file, indent=4)

# Generate SHA-256 hash of a file
def get_file_hash(filepath):
    hash_sha256 = hashlib.sha256()
    try:
        with open(filepath, "rb") as file:
            for chunk in iter(lambda: file.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return None

# Check if a file has been modified
def check_file_integrity(filepath, hashes):
    current_hash = get_file_hash(filepath)
    if current_hash is None:
        return

    if filepath in hashes:
        if hashes[filepath] == current_hash:
            print(f"✅ {filepath} - File is unchanged.")
        else:
            print(f"⚠️ ALERT: {filepath} has been modified!")
    else:
        print(f"🆕 New file detected: {filepath}")
        hashes[filepath] = current_hash
        save_hashes(hashes)

# Main program loop
def main():
    print("🔒 File Integrity Checker 🔍")
    hashes = load_hashes()

    while True:
        print("\nOptions:")
        print("1️⃣ Check a file")
        print("2️⃣ Show saved file hashes")
        print("3️⃣ Exit")
        choice = input("Enter your choice: ")

        if choice == "1":
            filepath = input("Enter the file path: ").strip()
            check_file_integrity(filepath, hashes)
        elif choice == "2":
            print(json.dumps(hashes, indent=4))
        elif choice == "3":
            print("👋 Exiting... Stay secure!")
            break
        else:
            print("❌ Invalid choice, try again.")

if __name__ == "__main__":
    main()
