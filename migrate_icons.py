"""
Script de migración: Material Symbols Rounded → AppIconComponent (Lucide)
Procesa todos los archivos .ts del frontend Angular.
"""
import re
import os
import glob

FRONTEND_SRC = r'C:\Users\59178\Desktop\AsisteCar\frontend\src\app'

# Clases de tamaño Material Symbols → valor numérico para [size]
SIZE_MAP = {
    r'text-\[(\d+)px\]': lambda m: int(m.group(1)),
    r'text-\[1\.3rem\]': lambda m: 20,
    r'text-\[0\.6rem\]': lambda m: 10,
    r'text-4xl': lambda m: 36,
    r'text-3xl': lambda m: 30,
    r'text-2xl': lambda m: 24,
    r'text-xl': lambda m: 20,
    r'text-lg': lambda m: 18,
    r'text-sm': lambda m: 14,
    r'text-xs': lambda m: 12,
}

def extract_size(class_str):
    """Extrae el tamaño numérico de las clases CSS, retorna (size, remaining_classes)."""
    size = 20  # default
    remaining = class_str
    for pattern, extractor in SIZE_MAP.items():
        m = re.search(pattern, remaining)
        if m:
            size = extractor(m)
            remaining = remaining[:m.start()] + remaining[m.end():]
            break
    return size, remaining.strip()

def clean_classes(class_str):
    """Elimina la clase material-symbols-rounded y normaliza espacios."""
    c = re.sub(r'material-symbols-rounded', '', class_str)
    c = re.sub(r'\s+', ' ', c).strip()
    return c

def build_app_icon(name_part, size, extra_classes, is_dynamic):
    """Construye el tag <app-icon> adecuado."""
    parts = ['<app-icon']
    if is_dynamic:
        parts.append(f'[name]="{name_part}"')
    else:
        parts.append(f'name="{name_part}"')
    if size != 20:
        parts.append(f'[size]="{size}"')
    if extra_classes:
        parts.append(f'class="{extra_classes}"')
    parts.append('/>')
    return ' '.join(parts)

def replace_spans(content):
    """Reemplaza todos los <span class="material-symbols-rounded...">...</span>"""
    changed = False

    # Patrón: <span class="..material-symbols-rounded..">CONTENT</span>
    # El CONTENT puede ser texto estático o {{ expresión }}
    pattern = re.compile(
        r'<span\s+class="([^"]*material-symbols-rounded[^"]*)"\s*>'
        r'((?:(?!<\/span>).)*?)'
        r'<\/span>',
        re.DOTALL
    )

    def replacer(m):
        nonlocal changed
        full_class = m.group(1)
        inner = m.group(2).strip()

        # Limpiar clases
        clean = clean_classes(full_class)
        size, extra_classes = extract_size(clean)

        # ¿Es binding dinámico?
        if inner.startswith('{{') and inner.endswith('}}'):
            expr = inner[2:-2].strip()
            is_dynamic = True
        else:
            expr = inner
            is_dynamic = False

        if not expr:
            return m.group(0)  # no reemplazar si está vacío

        changed = True
        return build_app_icon(expr, size, extra_classes, is_dynamic)

    new_content = pattern.sub(replacer, content)
    return new_content, changed

def inject_app_icon_import(content, filepath):
    """Agrega AppIconComponent al array imports[] del componente si no está ya."""
    if 'AppIconComponent' in content:
        return content, False  # ya tiene el import

    # Agregar el import del módulo al inicio del archivo
    import_line = "import { AppIconComponent } from '../shared/app-icon.component';\n"

    # Ajustar la ruta relativa según la profundidad del archivo
    rel = os.path.relpath(
        os.path.join(FRONTEND_SRC, 'shared', 'app-icon.component'),
        os.path.dirname(filepath)
    ).replace('\\', '/')
    if not rel.startswith('.'):
        rel = './' + rel
    import_line = f"import {{ AppIconComponent }} from '{rel}';\n"

    # Insertar después del último import existente
    last_import = list(re.finditer(r'^import\s+.*?;', content, re.MULTILINE))
    if not last_import:
        content = import_line + content
    else:
        pos = last_import[-1].end()
        content = content[:pos] + '\n' + import_line.rstrip('\n') + content[pos:]

    # Agregar AppIconComponent al array imports: [...]
    # Busca patterns como: imports: [CommonModule, ...] o imports: [...]
    def add_to_imports(m):
        inner = m.group(1)
        if 'AppIconComponent' in inner:
            return m.group(0)
        # Agregar al inicio de la lista
        if inner.strip():
            return f'imports: [{inner}, AppIconComponent]'
        else:
            return 'imports: [AppIconComponent]'

    content = re.sub(
        r'imports:\s*\[([^\]]*)\]',
        add_to_imports,
        content,
        count=1
    )
    return content, True

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    # Solo procesar si tiene material-symbols-rounded
    if 'material-symbols-rounded' not in original:
        return False

    content, span_changed = replace_spans(original)
    if span_changed:
        content, import_changed = inject_app_icon_import(content, filepath)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  [OK] {os.path.relpath(filepath, FRONTEND_SRC)}')
        return True
    return False

def main():
    ts_files = glob.glob(os.path.join(FRONTEND_SRC, '**', '*.ts'), recursive=True)
    print(f'Procesando {len(ts_files)} archivos TypeScript...\n')
    updated = 0
    for f in sorted(ts_files):
        if process_file(f):
            updated += 1
    print(f'\nActualizados: {updated} archivos.')

if __name__ == '__main__':
    main()
