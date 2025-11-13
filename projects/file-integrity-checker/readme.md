# 🛡️ File Integrity Checker

### 📖 Overview
This Python project monitors and verifies file integrity by generating and comparing SHA256 hashes.  
It helps detect any unauthorized changes, deletions, or tampering with system files.

---

### ⚙️ How It Works
2. The program generates hash values for every file and saves them in `file_hashes.json`.
3. When re-run, it compares the current file hashes with stored ones.
4. If any file is modified, deleted, or newly added, it alerts the user.

---

### 🧠 Example Output
```bash
🔒 File Integrity Checker 🔍
Enter the folder path to monitor: C:\Users\Soham\Desktop\Test
✅ Hashes saved to file_hashes.json
⚠️ ALERT: File modified -> notes.txt
❌ ALERT: File deleted -> report.docx
