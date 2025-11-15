#!/usr/bin/env python3
"""
Clean up duplicate skills in active_skill.md - keep only the LAST occurrence of each skill.
"""

import re
from pathlib import Path
from collections import OrderedDict

ACTIVE_SKILL_FILE = Path(r"E:\Laravel\study\skill_system\.claude\hook\choose_skill.md\active_skill.md")

def main():
    print("[*] Cleaning up duplicates in active_skill.md...")
    
    with open(ACTIVE_SKILL_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split content into sections
    # Pattern: ## Skill name: until next ## Skill or end
    sections = re.split(r'(## Skill [^:]+:)', content)
    
    # sections[0] is header before first skill
    # sections[1:] are alternating: skill header, skill content, skill header, skill content...
    
    header = sections[0] if sections else ""
    skill_sections = {}  # OrderedDict to keep last occurrence
    
    # Process in pairs: header + content
    i = 1
    while i < len(sections):
        if i + 1 < len(sections):
            skill_header = sections[i]  # e.g., "## Skill database-performance-optimization:"
            skill_content = sections[i + 1]
            
            # Extract skill name from header
            match = re.match(r'## Skill ([^:]+):', skill_header)
            if match:
                skill_name = match.group(1)
                # Store with header + content (will overwrite if duplicate, keeping last)
                skill_sections[skill_name] = skill_header + skill_content
                print(f"    Found: {skill_name}")
        i += 2
    
    print(f"\n[*] Total unique skills: {len(skill_sections)}")
    
    # Rebuild content: header + all unique skills
    new_content = header + ''.join(skill_sections.values())
    
    # Write back
    with open(ACTIVE_SKILL_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"[SUCCESS] Cleaned up! File now has {len(skill_sections)} unique skills.")

if __name__ == "__main__":
    main()
