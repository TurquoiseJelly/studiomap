import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { useGearPack, useWorkflow } from '@/hooks/useGearPack'
import { InteractiveDiagram } from '@/components/gear'
import { Button } from '@/components/ui'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useUserStore } from '@/stores/user-store'

export function WorkflowPage() {
  const { gearId, workflowId } = useParams<{ gearId: string; workflowId: string }>()
  const { manifest } = useGearPack(gearId)
  const { workflow, isLoading, error } = useWorkflow(gearId, workflowId)
  const { getWorkflowProgress, startWorkflow, updateWorkflowStep, completeWorkflow } = useUserStore()

  const progress = getWorkflowProgress(gearId!, workflowId!)
  const [currentStep, setCurrentStep] = useState(progress?.currentStep || 0)
  const [isDiagramOpen, setIsDiagramOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-secondary)]">Loading workflow...</div>
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">Failed to load workflow</div>
      </div>
    )
  }

  const step = workflow.steps[currentStep]
  const isLastStep = currentStep === workflow.steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (!progress) {
      startWorkflow(gearId!, workflowId!)
    }
    if (step) {
      updateWorkflowStep(gearId!, workflowId!, step.id)
    }
    if (isLastStep) {
      completeWorkflow(gearId!, workflowId!)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <>
      {/* Mobile Diagram Button */}
      {manifest && (
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setIsDiagramOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/30"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            View Diagram
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workflow content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                workflow.difficulty === 'beginner' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                workflow.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                workflow.difficulty === 'advanced' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {workflow.difficulty}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold">{workflow.title}</h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">{workflow.description}</p>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
            <span>Progress</span>
            <span>
              {currentStep + 1} of {workflow.steps.length}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{ width: `${((currentStep + 1) / workflow.steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current step */}
        {step && (
          <div className="rounded-xl border border-[var(--color-border)] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <span className="font-semibold">{currentStep + 1}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{step.title}</h2>
                <p className="mt-2">{step.instruction}</p>

                {/* Substeps */}
                {step.substeps && step.substeps.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {step.substeps.map((substep, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
                        {substep.instruction}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tip */}
                {step.tip && (
                  <div className="mt-4 rounded-lg border-l-4 border-green-500/30 bg-green-500/5 p-3">
                    <div className="flex gap-2">
                      <svg className="h-5 w-5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-sm">{step.tip}</span>
                    </div>
                  </div>
                )}

                {/* Warning */}
                {step.warning && (
                  <div className="mt-4 rounded-lg border-l-4 border-yellow-500/30 bg-yellow-500/5 p-3">
                    <div className="flex gap-2">
                      <svg className="h-5 w-5 flex-shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm">{step.warning}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={handlePrev} disabled={isFirstStep}>
            Previous
          </Button>
          <Button onClick={handleNext}>
            {isLastStep ? 'Complete' : 'Next'}
          </Button>
        </div>

        {/* Outcomes (shown on last step) */}
        {isLastStep && (
          <div className="rounded-xl border border-[var(--color-border)] p-6">
            <h3 className="font-semibold">What you've learned:</h3>
            <ul className="mt-3 space-y-2">
              {workflow.outcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

        {/* Diagram - Desktop only */}
        {manifest && (
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <InteractiveDiagram
                gearId={gearId!}
                manifest={manifest}
                highlightedHotspots={step?.diagramHighlights || []}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Diagram Bottom Sheet */}
      {manifest && (
        <BottomSheet
          isOpen={isDiagramOpen}
          onClose={() => setIsDiagramOpen(false)}
          title="Interactive Diagram"
        >
          <InteractiveDiagram
            gearId={gearId!}
            manifest={manifest}
            highlightedHotspots={step?.diagramHighlights || []}
          />
        </BottomSheet>
      )}
    </>
  )
}
