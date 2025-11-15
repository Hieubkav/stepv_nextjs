#!/usr/bin/env python3
import re
from pathlib import Path

ACTIVE_SKILL_FILE = Path(r"E:\Laravel\study\skill_system\.claude\hook\choose_skill.md\active_skill.md")

with open(ACTIVE_SKILL_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all skill names
skills = re.findall(r'^## Skill ([^:]+):', content, re.MULTILINE)

print(f"Total skills found: {len(skills)}\n")
for i, skill in enumerate(skills, 1):
    print(f"{i:2d}. {skill}")
