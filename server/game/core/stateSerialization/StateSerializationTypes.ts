export const generatedCopyModeValues = ['CompileTime', 'Runtime'] as const;

export type GeneratedCopyMode = (typeof generatedCopyModeValues)[number];

export const stateFieldKindValues = ['primitive', 'value', 'ref', 'refArray', 'refMap', 'refSet', 'refRecord'] as const;

export type StateFieldKind = (typeof stateFieldKindValues)[number];

export interface GeneratedStateFieldDescriptor {
    name: string;
    kind: StateFieldKind;
    readonlyArray?: boolean;
}

export interface GeneratedStateClassEntry {
    className: string;
    copyMode: GeneratedCopyMode;
    sourcePath: string;
    fields: GeneratedStateFieldDescriptor[];
}