import json
from pathlib import Path

path = Path('static/lessons/index.json')
data = json.loads(path.read_text(encoding='utf-8'))

# List of lessons requiring code workspace
editor_lessons = {'lesson-003', 'lesson-004', 'lesson-005', 'lesson-006'}

for lesson in data:
    lid = lesson.get('id')
    lesson['requiresEditor'] = lid in editor_lessons
    print(f"Set {lid} requiresEditor = {lesson['requiresEditor']}")

path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
print("Successfully updated index.json with requiresEditor flags.")
