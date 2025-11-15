#!/usr/bin/env python3
"""
Update active_skill.md by removing old duplicate skills and adding new merged skills.
"""

import re
from pathlib import Path

# File path
ACTIVE_SKILL_FILE = Path(r"E:\Laravel\study\skill_system\.claude\hook\choose_skill.md\active_skill.md")

# Skills to remove (old duplicates + existing versions that will be replaced)
SKILLS_TO_REMOVE = [
    "database-performance-tuning",
    "sql-query-optimization",
    "e2e-testing-patterns",
    "playwright-automation",
    "filament-rules",
    "frontend-components",
    "seo-content-optimizer",
    "google-official-seo-guide",
    "ux-designer",
    "ui-design-system",
    "tailwind-css",
    # Also remove existing versions that will be replaced with merged versions
    "filament-resource-generator",  # Will be replaced with enhanced version
    "react-component-architecture",  # Will be replaced with enhanced version
    "ui-styling",  # Will be replaced with enhanced version
]

# New merged skills to add
NEW_SKILLS = """
## Skill database-performance-optimization:
- Đường dẫn: \\.claude\\skills\\database\\database-performance-optimization
- Mô tả: Master database and SQL query optimization through index analysis, EXPLAIN plans, query profiling, N+1 pattern fixes, efficient pagination, and performance tuning. Identify bottlenecks, optimize slow queries, and implement indexing strategies for dramatically improved database performance. Use when debugging slow queries, analyzing workloads, improving query execution speed, or optimizing application performance.
- Lời gọi kích hoạt:
  - "optimize database"
  - "tối ưu database"
  - "slow query"
  - "query chậm"
  - "database performance"
  - "hiệu năng database"
  - "index optimization"
  - "EXPLAIN plan"
  - "query profiling"
  - "missing index"
  - "unused index"
  - "database tuning"
  - "SQL optimization"
  - "tối ưu SQL"
  - "optimize query"
  - "tối ưu query"
  - "SQL performance"
  - "N+1 query"
  - "query optimization"
  - "indexing strategy"
  - "EXPLAIN ANALYZE"
  - "query patterns"
  - "efficient pagination"

## Skill playwright-e2e-testing:
- Đường dẫn: \\.claude\\skills\\testing\\playwright-e2e-testing
- Mô tả: Complete E2E testing and browser automation with Playwright. Build reliable test suites, automate browser tasks, test pages/forms, validate UX, check responsive design, test login flows, implement test patterns, debug flaky tests. Auto-detects dev servers, provides testing best practices. Use when implementing E2E tests, automating browser interactions, establishing testing standards, or debugging flaky tests.
- Lời gọi kích hoạt:
  - "E2E testing"
  - "end-to-end testing"
  - "Playwright"
  - "browser automation"
  - "test automation"
  - "E2E patterns"
  - "flaky tests"
  - "testing standards"
  - "Playwright test"
  - "web automation"
  - "test browser"
  - "automated testing"

## Skill filament-resource-generator:
- Đường dẫn: \\.claude\\skills\\filament\\filament-resource-generator
- Mô tả: Automated Filament 4.x resource generation following coding standards (Schema namespace, Vietnamese labels, Observer patterns, ImagesRelationManager). Includes namespace rules, best practices, form/table patterns, and RelationManagers. USE WHEN creating resources, fixing namespace errors, implementing forms/tables, RelationManagers, Settings pages, or any Filament development.
- Lời gọi kích hoạt:
  - "tạo resource mới"
  - "create new resource"
  - "generate Filament resource"
  - "scaffold admin resource"
  - "tạo Filament resource"
  - "new Filament resource"
  - "admin panel resource"
  - "generate resource"
  - "make filament resource"
  - "filament resource"
  - "admin resource"
  - "tạo admin resource"
  - "Filament standards"
  - "chuẩn Filament"
  - "Filament 4.x"
  - "Filament development"
  - "Filament coding"
  - "Filament best practices"
  - "Schema namespace"
  - "RelationManager"
  - "Filament Settings"
  - "Filament form"
  - "Filament table"
  - "Filament patterns"

## Skill react-component-architecture:
- Đường dẫn: \\.claude\\skills\\frontend\\react-component-architecture
- Mô tả: Design scalable, reusable React components following single responsibility principle with functional components, hooks, composition patterns, TypeScript, clear interfaces, encapsulation, and minimal props. Use when building reusable component libraries, maintainable UI systems, or creating/modifying frontend components in any framework.
- Lời gọi kích hoạt:
  - "React architecture"
  - "React components"
  - "React hooks"
  - "React patterns"
  - "React composition"
  - "React TypeScript"
  - "React best practices"
  - "frontend components"
  - "UI components"
  - "component design"
  - "reusable components"
  - "component architecture"
  - "Vue components"

## Skill seo-optimization:
- Đường dẫn: \\.claude\\skills\\content_marketing\\seo-optimization
- Mô tả: Comprehensive SEO optimization using official Google guidelines. Optimize content with keyword analysis, readability scoring, meta descriptions, Search Console, crawling, indexing, structured data, and rich results. Use when improving SEO, optimizing content, analyzing search performance, or following Google best practices.
- Lời gọi kích hoạt:
  - "SEO optimization"
  - "optimize SEO"
  - "SEO content"
  - "keyword analysis"
  - "meta description"
  - "readability"
  - "content optimization"
  - "search optimization"
  - "Google SEO"
  - "SEO best practices"
  - "Google Search Console"
  - "search visibility"
  - "crawling"
  - "indexing"
  - "structured data"
  - "rich results"
  - "Google ranking"

## Skill ui-ux-design-system:
- Đường dẫn: \\.claude\\skills\\frontend\\ui-ux-design-system
- Mô tả: Expert UI/UX design and design system toolkit. Build accessible, user-centered interfaces with design tokens, component documentation, responsive calculations, visual design decisions (colors, typography, layouts). Use when designing interfaces, creating design systems, making design decisions, choosing colors/typography/layouts, implementing responsive design, or improving accessibility.
- Lời gọi kích hoạt:
  - "design" / "thiết kế"
  - "UI" / "UX"
  - "styling" / "visual"
  - "appearance" / "giao diện"
  - "colors" / "màu sắc"
  - "fonts" / "typography"
  - "layouts" / "spacing"
  - "responsive" / "mobile"
  - "accessibility" / "WCAG"
  - "user interface" / "user experience"
  - "thiết kế giao diện" / "thiết kế UI/UX"
  - "design system"
  - "design tokens"
  - "design guidelines"
  - "component documentation"
  - "design tokens generation"

## Skill ui-styling:
- Đường dẫn: \\.claude\\skills\\frontend\\ui-styling
- Mô tả: Create beautiful, accessible user interfaces with shadcn/ui components (Radix UI + Tailwind), Tailwind CSS utility-first framework, responsive design, dark mode, component patterns, and canvas-based visual designs. Master Tailwind utilities, customization, production optimization. Use when building user interfaces, implementing design systems, creating responsive layouts, styling components, customizing themes, or establishing styling patterns.
- Lời gọi kích hoạt:
  - "shadcn/ui"
  - "shadcn"
  - "Radix UI"
  - "UI styling"
  - "accessible components"
  - "design system"
  - "Tailwind components"
  - "dark mode"
  - "Tailwind CSS"
  - "Tailwind"
  - "utility-first CSS"
  - "Tailwind dark mode"
  - "Tailwind responsive"
  - "Tailwind customization"
"""


def remove_skill_section(content: str, skill_name: str) -> str:
    """Remove a skill section from content."""
    # Pattern to match: ## Skill {skill-name}: until next ## Skill or end of file
    pattern = rf"## Skill {re.escape(skill_name)}:.*?(?=\n## Skill |\Z)"
    content = re.sub(pattern, "", content, flags=re.DOTALL)
    return content


def main():
    print("[*] Updating active_skill.md...")
    print(f"[*] File: {ACTIVE_SKILL_FILE}")
    
    # Read current content
    if not ACTIVE_SKILL_FILE.exists():
        print(f"[ERROR] File not found: {ACTIVE_SKILL_FILE}")
        return
    
    with open(ACTIVE_SKILL_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_length = len(content)
    print(f"[*] Original file size: {original_length} characters")
    
    # Remove old skills
    print(f"\n[*] Removing {len(SKILLS_TO_REMOVE)} old duplicate skills...")
    for skill in SKILLS_TO_REMOVE:
        print(f"    - Removing: {skill}")
        content = remove_skill_section(content, skill)
    
    # Clean up excessive blank lines (more than 2 consecutive)
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    
    after_removal = len(content)
    removed_chars = original_length - after_removal
    print(f"[OK] Removed {removed_chars} characters")
    
    # Add new merged skills at the end
    print(f"\n[*] Adding 7 new merged skills...")
    content = content.rstrip() + "\n" + NEW_SKILLS.strip() + "\n"
    
    # Write updated content
    with open(ACTIVE_SKILL_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    
    final_length = len(content)
    print(f"[OK] Final file size: {final_length} characters")
    print(f"[*] Net change: {final_length - original_length:+d} characters")
    
    print("\n[SUCCESS] active_skill.md updated successfully!")
    print("\n[SUMMARY]")
    print(f"    - Removed: {len(SKILLS_TO_REMOVE)} old skills")
    print(f"    - Added: 7 new merged skills")
    print(f"    - Net reduction: {len(SKILLS_TO_REMOVE) - 7} skills")
    print(f"\n[RESULT] Skill system now has 53 skills (down from 60)")


if __name__ == "__main__":
    main()
