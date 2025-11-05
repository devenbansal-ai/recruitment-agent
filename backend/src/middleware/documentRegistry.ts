// documentRegistry.ts
type DocMeta = {
  id: string;
  name: string;
  source: string;
  uploadedAt: Date;
};

const registry: Record<string, DocMeta> = {};

export function registerDocument(meta: DocMeta) {
  registry[meta.id] = meta;
}

export function getDocumentByName(name: string) {
  return Object.values(registry).find((d) => d.name === name);
}

export function listDocuments() {
  return Object.values(registry);
}

export function deleteDocument(id: string) {
  delete registry[id];
}
