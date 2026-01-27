import os
import ast
import sys

migrations_dir = 'backend/migrations/versions'
print(f"Checking {migrations_dir}")

for f in sorted(os.listdir(migrations_dir)):
    if not f.endswith('.py'):
        continue
    
    path = os.path.join(migrations_dir, f)
    with open(path, 'r') as file:
        try:
            tree = ast.parse(file.read())
            revision = None
            down_revision = None
            
            for node in tree.body:
                if isinstance(node, ast.Assign) or isinstance(node, ast.AnnAssign):
                    target = node.target if isinstance(node, ast.AnnAssign) else node.targets[0]
                    if isinstance(target, ast.Name):
                        if target.id == 'revision':
                            if isinstance(node.value, ast.Constant):
                                revision = node.value.value
                        elif target.id == 'down_revision':
                            if isinstance(node.value, ast.Constant):
                                down_revision = node.value.value
                            elif isinstance(node.value, ast.Tuple):
                                down_revision = [elt.value for elt in node.value.elts]
            
            print(f"{f}: {revision} -> {down_revision}")
        except Exception as e:
            print(f"Error parsing {f}: {e}")
