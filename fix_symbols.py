import os
import re

src_dir = r'c:\Users\ansar\Downloads\SuvarnaAranjo_code\Website\frontend\src'

def replacer_backtick(match):
    text = match.group(0)
    text = text.replace('??{', '₹${')
    text = text.replace('?{', '${')
    return text

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    # Fix backticks
    content = re.sub(r'`[^`]*`', replacer_backtick, content)
    
    # Fix JSX elements where ?{var} should be ₹{var}
    def replacer_jsx(match):
        inner = match.group(1)
        if inner.startswith("' '") or inner.startswith('" "'):
            return f"?{{{inner}}}"
        return f"₹{{{inner}}}"

    content = re.sub(r'\?\{([^}]+)\}', replacer_jsx, content)
    
    # Replace literal "?" used for currency
    content = content.replace("Price (?)", "Price (₹)")
    content = content.replace("Discount Price (?)", "Discount Price (₹)")
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {os.path.basename(filepath)}")

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            process_file(filepath)
            
print("Fix script completed.")
