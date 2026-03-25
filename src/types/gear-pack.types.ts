// Gear categories
export type GearCategory =
  | 'groovebox'
  | 'synthesizer'
  | 'sampler'
  | 'drum-machine'
  | 'sequencer'
  | 'effects'
  | 'controller'
  | 'mixer'
  | 'audio-interface'
  | 'other'

// Hotspot types for diagram elements
export type HotspotType = 'knob' | 'button' | 'pad' | 'fader' | 'display' | 'port' | 'switch' | 'led'

// Hotspot tooltip information
export interface HotspotTooltip {
  title: string
  description: string
  tip?: string
}

// Link to a section in the documentation
export interface SectionLink {
  sectionId: string
  headingId?: string
}

// Hotspot definition (clickable region on diagram)
export interface HotspotDefinition {
  id: string
  label: string
  type: HotspotType
  tooltip: HotspotTooltip
  linkedSection?: SectionLink
  ariaLabel: string
}

// Diagram configuration
export interface DiagramConfig {
  width: number
  height: number
  hotspots: Record<string, HotspotDefinition>
}

// Section index entry in manifest
export interface SectionIndex {
  id: string
  title: string
  order: number
  icon?: string
}

// Workflow index entry in manifest
export interface WorkflowIndex {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedSteps: number
}

// Paths to resources in the gear pack
export interface GearPackPaths {
  thumbnail: string
  diagram: string
  quickReference: string
  glossary: string
}

// Gear pack metadata
export interface GearPackMetadata {
  name: string
  manufacturer: string
  category: GearCategory
  description: string
  tags: string[]
  year?: number
  website?: string
}

// Main gear pack manifest (loaded first)
export interface GearPackManifest {
  id: string
  version: string
  metadata: GearPackMetadata
  diagram: DiagramConfig
  sections: SectionIndex[]
  workflows: WorkflowIndex[]
  paths: GearPackPaths
}

// Content block types for sections
export type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'table'
  | 'callout'
  | 'diagram-reference'
  | 'feature-block'
  | 'code'

// Callout types
export type CalloutType = 'tip' | 'warning' | 'info' | 'note'

// Base content block
export interface BaseContentBlock {
  type: ContentBlockType
}

// Heading block
export interface HeadingBlock extends BaseContentBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4
  text: string
  id?: string
}

// Paragraph block
export interface ParagraphBlock extends BaseContentBlock {
  type: 'paragraph'
  text: string
}

// List block
export interface ListBlock extends BaseContentBlock {
  type: 'list'
  ordered: boolean
  items: string[]
}

// Table block
export interface TableBlock extends BaseContentBlock {
  type: 'table'
  headers: string[]
  rows: string[][]
}

// Callout block
export interface CalloutBlock extends BaseContentBlock {
  type: 'callout'
  calloutType: CalloutType
  title?: string
  text: string
}

// Diagram reference block (highlights hotspots)
export interface DiagramReferenceBlock extends BaseContentBlock {
  type: 'diagram-reference'
  hotspotIds: string[]
  caption?: string
}

// Feature block (name + description + linked hotspot)
export interface FeatureBlock extends BaseContentBlock {
  type: 'feature-block'
  name: string
  description: string
  hotspotId?: string
}

// Code block
export interface CodeBlock extends BaseContentBlock {
  type: 'code'
  language?: string
  code: string
}

// Union type for all content blocks
export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | TableBlock
  | CalloutBlock
  | DiagramReferenceBlock
  | FeatureBlock
  | CodeBlock

// Section content (lazy-loaded)
export interface Section {
  id: string
  title: string
  content: ContentBlock[]
}

// Workflow substep
export interface WorkflowSubstep {
  instruction: string
  hotspotId?: string
}

// Workflow step
export interface WorkflowStep {
  id: string
  title: string
  instruction: string
  diagramHighlights?: string[]
  tip?: string
  warning?: string
  substeps?: WorkflowSubstep[]
}

// Workflow (step-by-step guide)
export interface Workflow {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: WorkflowStep[]
  outcomes: string[]
}

// Quick reference entry
export interface QuickReferenceEntry {
  id: string
  category: string
  action: string
  shortcut: string
  description?: string
  hotspotIds?: string[]
}

// Quick reference data
export interface QuickReference {
  categories: string[]
  entries: QuickReferenceEntry[]
}

// Glossary term
export interface GlossaryTerm {
  id: string
  term: string
  definition: string
  relatedTerms?: string[]
  linkedSections?: SectionLink[]
}

// Glossary data
export interface Glossary {
  terms: GlossaryTerm[]
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
}

// Owned gear entry
export interface OwnedGear {
  gearId: string
  addedAt: string
  favorite: boolean
  notes?: string
}

// Workflow progress
export interface WorkflowProgress {
  gearId: string
  workflowId: string
  currentStep: number
  completedSteps: string[]
  startedAt: string
  completedAt?: string
}

// Recently viewed entry
export interface RecentlyViewed {
  gearId: string
  viewedAt: string
  lastSection?: string
}

// User data stored in localStorage
export interface UserData {
  preferences: UserPreferences
  ownedGear: OwnedGear[]
  workflowProgress: WorkflowProgress[]
  recentlyViewed: RecentlyViewed[]
}

// Section learning progress
export interface SectionProgress {
  gearId: string
  sectionId: string
  completedAt: string
}

// Mastery levels based on completion percentage
export type MasteryLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'master'
