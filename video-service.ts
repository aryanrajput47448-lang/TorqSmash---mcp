export function reviewVideoBrief(input: { description: string; durationSeconds?: number; timestampNotes?: string; outcome?: string }) {
  return {
    ...input,
    analysisScope: 'Text-only review of the supplied description and notes. This service does not decode video files, inspect frames or process audio.',
    reviewChecklist: [
      'Can a viewer understand the challenge in the opening second?',
      'Does the first frame clearly show the cars and obstacle?',
      'Is setup time short enough to reach the main action quickly?',
      'Does each shot add new information?',
      'Is the outcome clearly shown and consistent with the hook?',
      'Does the ending feel complete or create a natural replay?'
    ],
    instruction: 'Give actionable editing suggestions. Only provide timestamps when the user supplied timestamp notes.'
  };
}
