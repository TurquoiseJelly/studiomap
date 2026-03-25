import { clsx } from 'clsx'
import type { ContentBlock, Section } from '@/types/gear-pack.types'

interface SectionContentProps {
  section: Section
  onHotspotHighlight?: (hotspotIds: string[]) => void
}

export function SectionContent({ section, onHotspotHighlight }: SectionContentProps) {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      {section.content.map((block, index) => (
        <ContentBlockRenderer
          key={index}
          block={block}
          onHotspotHighlight={onHotspotHighlight}
        />
      ))}
    </article>
  )
}

interface ContentBlockRendererProps {
  block: ContentBlock
  onHotspotHighlight?: (hotspotIds: string[]) => void
}

function ContentBlockRenderer({ block, onHotspotHighlight }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'heading':
      return <HeadingBlock level={block.level} text={block.text} id={block.id} />

    case 'paragraph':
      return <p>{block.text}</p>

    case 'list':
      return block.ordered ? (
        <ol>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )

    case 'table':
      return (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {block.headers.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'callout':
      return (
        <CalloutBlock
          calloutType={block.calloutType}
          title={block.title}
          text={block.text}
        />
      )

    case 'diagram-reference':
      return (
        <DiagramReferenceBlock
          hotspotIds={block.hotspotIds}
          caption={block.caption}
          onHighlight={onHotspotHighlight}
        />
      )

    case 'feature-block':
      return (
        <FeatureBlockComponent
          name={block.name}
          description={block.description}
          hotspotId={block.hotspotId}
          onHighlight={onHotspotHighlight}
        />
      )

    case 'code':
      return (
        <pre>
          <code className={block.language ? `language-${block.language}` : ''}>
            {block.code}
          </code>
        </pre>
      )

    default:
      return null
  }
}

function HeadingBlock({
  level,
  text,
  id,
}: {
  level: 1 | 2 | 3 | 4
  text: string
  id?: string
}) {
  switch (level) {
    case 1:
      return <h1 id={id} className="scroll-mt-20">{text}</h1>
    case 2:
      return <h2 id={id} className="scroll-mt-20">{text}</h2>
    case 3:
      return <h3 id={id} className="scroll-mt-20">{text}</h3>
    case 4:
      return <h4 id={id} className="scroll-mt-20">{text}</h4>
  }
}

function CalloutBlock({
  calloutType,
  title,
  text,
}: {
  calloutType: 'tip' | 'warning' | 'info' | 'note'
  title?: string
  text: string
}) {
  const styles = {
    tip: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
    note: 'border-surface-500/30 bg-surface-500/5',
  }

  const icons = {
    tip: (
      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    note: (
      <svg className="h-5 w-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  }

  return (
    <div className={clsx('not-prose my-4 rounded-lg border-l-4 p-4', styles[calloutType])}>
      <div className="flex gap-3">
        {icons[calloutType]}
        <div>
          {title && <div className="font-semibold">{title}</div>}
          <div className="text-sm">{text}</div>
        </div>
      </div>
    </div>
  )
}

function DiagramReferenceBlock({
  hotspotIds,
  caption,
  onHighlight,
}: {
  hotspotIds: string[]
  caption?: string
  onHighlight?: (ids: string[]) => void
}) {
  return (
    <button
      onClick={() => onHighlight?.(hotspotIds)}
      className="not-prose my-4 flex w-full items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 text-left transition-colors hover:bg-primary-100/50 dark:hover:bg-primary-900/20"
    >
      <svg className="h-5 w-5 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
      <span className="text-sm">
        {caption || 'Click to highlight on diagram'}
      </span>
    </button>
  )
}

function FeatureBlockComponent({
  name,
  description,
  hotspotId,
  onHighlight,
}: {
  name: string
  description: string
  hotspotId?: string
  onHighlight?: (ids: string[]) => void
}) {
  return (
    <div
      className={clsx(
        'not-prose my-4 rounded-lg border border-[var(--color-border)] p-4',
        hotspotId && 'cursor-pointer hover:border-primary-500/50'
      )}
      onClick={() => hotspotId && onHighlight?.([hotspotId])}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
        </div>
      </div>
    </div>
  )
}
