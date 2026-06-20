import os
import re

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Mapping based on instructions
    replacements = {
        r'text-gray-500': 'text-brand-navy/60',
        r'text-gray-800': 'text-brand-navy',
        r'text-gray-900': 'text-brand-navy',
        r'text-gray-950': 'text-brand-navy',
        r'bg-gray-50': 'bg-brand-cream/50',
        r'bg-gray-100': 'bg-brand-sage/40',
        r'border-gray-100': 'border-brand-sage/40',
        r'border-gray-150': 'border-brand-sage/40',
        r'border-gray-200': 'border-brand-sage/40',
        r'text-slate-400': 'text-brand-navy/50',
        r'text-slate-500': 'text-brand-navy/60',
        r'text-slate-700': 'text-brand-navy',
        r'text-slate-800': 'text-brand-navy',
        r'text-slate-900': 'text-brand-navy',
        r'text-slate-950': 'text-brand-navy',
        r'bg-slate-50': 'bg-brand-cream/50',
        r'bg-slate-100': 'bg-brand-sage/40',
        r'bg-slate-950': 'bg-brand-navy',
        r'text-rose-500': 'text-brand-brown',
        r'bg-rose-50': 'bg-brand-brown/10',
        r'text-brand-indigo': 'text-brand-brown',
        r'bg-indigo-50': 'bg-brand-brown/10',
        r'border-indigo-100': 'border-brand-brown/20',
        r'text-emerald-500': 'text-brand-brown',
        r'bg-emerald-50': 'bg-brand-brown/10',
        r'text-amber-400': 'text-brand-brown',
        r'bg-amber-500/10': 'bg-brand-brown/10',
        r'text-rose-400': 'text-brand-brown',
        r'border-rose-100': 'border-brand-brown/20'
    }

    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")

def main():
    root_dir = r'C:\Users\ansar\Downloads\SuvarnaAranjo_code\Website\frontend\src'
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.jsx'):
                update_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
