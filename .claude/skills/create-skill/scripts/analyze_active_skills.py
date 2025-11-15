#!/usr/bin/env python3
"""Analyze active_skill.md size and suggest optimization."""

from pathlib import Path

ACTIVE_SKILL_FILE = Path(r"E:\Laravel\study\skill_system\.claude\hook\choose_skill.md\active_skill.md")

with open(ACTIVE_SKILL_FILE, 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.splitlines()

# Stats
size_kb = len(content) / 1024
size_chars = len(content)
line_count = len(lines)
skill_count = content.count('## Skill ')

# Calculate average per skill
avg_lines_per_skill = line_count / skill_count if skill_count > 0 else 0
avg_chars_per_skill = size_chars / skill_count if skill_count > 0 else 0

print(f"""
=== ACTIVE_SKILL.MD ANALYSIS ===

File Size: {size_kb:.2f} KB
Characters: {size_chars:,}
Lines: {line_count}
Total Skills: {skill_count}

Average per skill:
  - Lines: {avg_lines_per_skill:.1f}
  - Characters: {avg_chars_per_skill:.0f}

=== OPTIMIZATION RECOMMENDATIONS ===

Current issue: AI loads ENTIRE file ({size_kb:.0f} KB) every time.

Solution 1: INDEX FILE (RECOMMENDED)
  - Create skill_index.md (lightweight, ~5-10 KB)
  - Contains: skill name + 1-line description + keywords
  - AI scans index first (fast)
  - Loads full details only for matched skills (on-demand)
  
  Benefits:
    [+] 90% less context load for initial scan
    [+] Faster skill matching
    [+] Progressive disclosure
    [+] Easy to maintain

Solution 2: SPLIT BY DOMAIN
  - database_skills.md (~{size_kb/7:.0f} KB)
  - frontend_skills.md (~{size_kb/7:.0f} KB)
  - api_skills.md (~{size_kb/7:.0f} KB)
  - etc.
  
  Benefits:
    [+] Load only relevant domain
    [+] Better organization
    
  Drawbacks:
    [-] AI needs to guess which file to load
    [-] Multiple file management

Solution 3: TOC (NOT RECOMMENDED)
  - TOC doesn't reduce context load
  - AI still reads entire file
  - Only helps humans, not AI
  
Recommendation: Implement Solution 1 (Index File)
""")
