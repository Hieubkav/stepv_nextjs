#!/usr/bin/env python3
"""
⚠️ DEPRECATED - No longer needed after simplification ⚠️

This script generated skill_index.md and split skills into individual files.
After simplification on 2025-11-14, we now use a single active_skill.md file
with compact format (1 bullet point per skill, max 200 chars).

Legacy purpose: Generate skill_index.md from active_skill.md.
Lightweight index for fast AI scanning - loads only matched skills on-demand.

DO NOT USE. Keep for reference only.
"""

import re
from pathlib import Path
from collections import defaultdict

ACTIVE_SKILL_FILE = Path(r"E:\Laravel\study\skill_system\.claude\hook\choose_skill.md\active_skill.md")
INDEX_OUTPUT = Path(r"E:\Laravel\study\skill_system\.claude\hook\choose_skill.md\skill_index.md")
SKILLS_DIR = Path(r"E:\Laravel\study\skill_system\.claude\hook\choose_skill.md\skills")

def extract_skills_from_active(content):
    """Extract all skills with their data."""
    skills = []
    
    # Split by ## Skill headers
    sections = re.split(r'(## Skill [^:]+:)', content)
    
    # Skip header (index 0)
    i = 1
    while i < len(sections):
        if i + 1 < len(sections):
            header = sections[i]  # e.g., "## Skill database-performance-optimization:"
            body = sections[i + 1]
            
            # Extract skill name
            match = re.match(r'## Skill ([^:]+):', header)
            if not match:
                i += 2
                continue
                
            skill_name = match.group(1)
            
            # Extract path
            path_match = re.search(r'- Đường dẫn: (.+)', body)
            skill_path = path_match.group(1).strip() if path_match else ""
            
            # Extract description (first line only for index)
            desc_match = re.search(r'- Mô tả: (.+?)(?=\n- Lời gọi)', body, re.DOTALL)
            if desc_match:
                full_desc = desc_match.group(1).strip()
                # Take first sentence only (up to first period + space, or first 120 chars)
                first_sentence = re.split(r'\.\s+', full_desc)[0]
                if len(first_sentence) > 150:
                    first_sentence = first_sentence[:147] + "..."
                skill_desc = first_sentence
            else:
                skill_desc = "No description"
            
            # Extract triggers (first 5 only for index)
            triggers = []
            trigger_section = re.search(r'- Lời gọi kích hoạt:\n((?:\s+- ".+"\n?)+)', body)
            if trigger_section:
                trigger_lines = re.findall(r'- "([^"]+)"', trigger_section.group(1))
                triggers = trigger_lines[:5]  # Only first 5 for compact index
            
            # Determine domain from path
            domain = "other"
            if skill_path:
                path_parts = skill_path.split('\\')
                if len(path_parts) >= 4:  # \.claude\skills\{domain}\{skill}
                    domain = path_parts[3]
            
            skills.append({
                'name': skill_name,
                'path': skill_path,
                'desc': skill_desc,
                'triggers': triggers,
                'domain': domain,
                'full_body': body
            })
        
        i += 2
    
    return skills


def generate_index(skills):
    """Generate compact index file."""
    
    # Group by domain
    by_domain = defaultdict(list)
    for skill in skills:
        by_domain[skill['domain']].append(skill)
    
    # Sort domains
    domains_sorted = sorted(by_domain.keys())
    
    total_skills = len(skills)
    total_domains = len(domains_sorted)
    
    index_content = f"""# Skill Index (Fast Scan)

**Purpose**: Lightweight index for AI to quickly match skills. Load full details on-demand.

**Usage**:
1. Scan this index for matching keywords/triggers
2. Load full skill details from: `.claude/hook/choose_skill.md/skills/{{domain}}/{{skill-name}}.md`

**Stats**: {total_skills} skills across {total_domains} domains

---

## Quick Reference by Domain

"""
    
    # Add skills by domain
    for domain in domains_sorted:
        domain_skills = by_domain[domain]
        index_content += f"### {domain.upper()} ({len(domain_skills)} skills)\n\n"
        
        for skill in domain_skills:
            # Compact format: Name | Short desc | Key triggers
            triggers_str = ", ".join([f'"{t}"' for t in skill['triggers'][:3]])
            
            index_content += f"**{skill['name']}**  \n"
            index_content += f"{skill['desc']}  \n"
            index_content += f"🔍 {triggers_str}  \n"
            index_content += f"📂 `{skill['path']}`\n\n"
    
    # Add footer
    index_content += """---

## How to Load Full Details

When you match a skill from this index:

1. **Extract path** from matched skill (e.g., `\\.claude\\skills\\database\\database-performance-optimization`)
2. **Load full skill file**: 
   ```
   Read: E:\\Laravel\\study\\skill_system\\.claude\\hook\\choose_skill.md\\skills\\{domain}\\{skill-name}.md
   ```
3. **Get complete info**: Full description, all triggers, detailed capabilities

**Why This Approach?**
- Initial scan: ~5 KB (this index) instead of ~27 KB (full active_skill.md)
- **82% context saved** on every skill lookup
- Progressive disclosure: Load details only when needed

---

*Generated automatically from active_skill.md*  
*To regenerate: `python .claude/skills/meta/create_skill/scripts/generate_skill_index.py`*
"""
    
    return index_content


def split_skills_to_files(skills):
    """Split skills into individual files by domain."""
    
    # Create skills directory structure
    SKILLS_DIR.mkdir(parents=True, exist_ok=True)
    
    created_files = []
    
    for skill in skills:
        domain = skill['domain']
        skill_name = skill['name']
        
        # Create domain directory
        domain_dir = SKILLS_DIR / domain
        domain_dir.mkdir(exist_ok=True)
        
        # Create skill file
        skill_file = domain_dir / f"{skill_name}.md"
        
        # Generate skill content (from active_skill.md body)
        skill_content = f"## Skill {skill_name}:\n{skill['full_body']}"
        
        with open(skill_file, 'w', encoding='utf-8') as f:
            f.write(skill_content)
        
        created_files.append(str(skill_file.relative_to(SKILLS_DIR.parent)))
    
    return created_files


def main():
    print("[*] Generating skill index from active_skill.md...")
    
    # Read active_skill.md
    if not ACTIVE_SKILL_FILE.exists():
        print(f"[ERROR] File not found: {ACTIVE_SKILL_FILE}")
        return
    
    with open(ACTIVE_SKILL_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"[*] Original file: {len(content)} characters")
    
    # Extract skills
    print("[*] Extracting skills...")
    skills = extract_skills_from_active(content)
    print(f"[OK] Extracted {len(skills)} skills")
    
    # Generate index
    print("[*] Generating index...")
    index_content = generate_index(skills)
    
    # Write index
    with open(INDEX_OUTPUT, 'w', encoding='utf-8') as f:
        f.write(index_content)
    
    index_size = len(index_content)
    original_size = len(content)
    savings = ((original_size - index_size) / original_size) * 100
    
    print(f"[OK] Index created: {INDEX_OUTPUT}")
    print(f"    - Original: {original_size:,} chars ({original_size/1024:.1f} KB)")
    print(f"    - Index: {index_size:,} chars ({index_size/1024:.1f} KB)")
    print(f"    - Savings: {savings:.1f}%")
    
    # Split skills into individual files
    print(f"\n[*] Splitting skills into individual files...")
    created_files = split_skills_to_files(skills)
    print(f"[OK] Created {len(created_files)} skill files")
    print(f"    - Location: {SKILLS_DIR}")
    
    # Print sample structure
    print(f"\n[STRUCTURE]")
    print(f"skill_index.md          <- AI loads this first (lightweight)")
    print(f"skills/")
    print(f"  +-- database/")
    print(f"  |   +-- database-performance-optimization.md")
    print(f"  |   +-- ...")
    print(f"  +-- frontend/")
    print(f"  |   +-- react-component-architecture.md")
    print(f"  |   +-- ...")
    print(f"  +-- ...")
    
    print(f"\n[SUCCESS] Index-based skill system ready!")
    print(f"[INFO] AI workflow: Load index -> Match skills -> Load matched skill details on-demand")


if __name__ == "__main__":
    main()
