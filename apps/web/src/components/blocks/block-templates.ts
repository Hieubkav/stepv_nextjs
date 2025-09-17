import { BLOCK_PRESETS } from "./block-presets";

type TemplateMap = Record<string, Record<string, unknown>>;

const TEMPLATE_MAP: TemplateMap = Object.fromEntries(
  BLOCK_PRESETS.filter((preset) => preset.template).map((preset) => [preset.kind, preset.template!]),
);

export function getTemplate(kind: string) {
  const template = TEMPLATE_MAP[kind];
  return template ? JSON.parse(JSON.stringify(template)) : undefined;
}

export function listTemplates() {
  return Object.keys(TEMPLATE_MAP);
}
