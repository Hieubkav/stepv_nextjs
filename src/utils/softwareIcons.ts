// Utility functions for handling software icons

export interface SoftwareIcon {
  name: string;
  image: string;
}

/**
 * Get software icons based on type string
 * Prevents duplicate icons and handles various software types
 */
export const getSoftwareIcons = (type: string): SoftwareIcon[] => {
  const icons: SoftwareIcon[] = [];
  const typeStr = type.toLowerCase().trim();
  const addedIcons = new Set<string>(); // Track added icons to prevent duplicates

  // Split by common separators and clean up
  const typeParts = typeStr.split(/[,\s]+/).filter(part => part.length > 0);

  // Check for each software type
  const checkAndAdd = (conditions: string[], iconName: string, imagePath: string) => {
    if (addedIcons.has(iconName)) return;

    const hasMatch = conditions.some(condition => {
      return typeParts.some(part => {
        // Exact match or contains for longer terms
        if (condition.length <= 3) {
          return part === condition; // Exact match for short terms like "pr", "ae"
        } else {
          return part.includes(condition); // Contains for longer terms like "premiere", "blender"
        }
      });
    });

    if (hasMatch) {
      icons.push({ name: iconName, image: imagePath });
      addedIcons.add(iconName);
    }
  };

  // Check each software (order matters - check specific terms first)
  checkAndAdd(['premiere', 'pr'], 'PR', '/images/icon_design/premiere-pro.png');
  checkAndAdd(['after effects', 'ae'], 'AE', '/images/icon_design/ae_icon.webp');
  checkAndAdd(['blender'], 'BL', '/images/icon_design/Blender_logo_no_text.svg.png');
  checkAndAdd(['c4d', 'cinema'], 'C4D', '/images/icon_design/c4d.png');
  checkAndAdd(['3ds', 'max'], '3DS', '/images/icon_design/3ds-max-logo-png_seeklogo-482396.png');
  checkAndAdd(['unreal', 'ue'], 'UE', '/images/icon_design/unreal.jpg');

  // If no specific software found, default to AE, PR
  if (icons.length === 0) {
    icons.push(
      { name: 'AE', image: '/images/icon_design/ae_icon.webp' },
      { name: 'PR', image: '/images/icon_design/premiere-pro.png' }
    );
  }

  return icons;
};

/**
 * Get formatted software names for display
 * Converts type string to readable software names
 */
export const getFormattedSoftwareNames = (type: string): string => {
  const icons = getSoftwareIcons(type);
  return icons.map(icon => icon.name).join(', ');
};
