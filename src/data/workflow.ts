// The five-step workflow shown on the Overview, with the recommendations that belong to each step.
// Recommendation ids are checked at build time (see index.astro), so a renamed or removed one fails the build.
export interface Step {
  name: string; l1: string; l2: string;
  topic: string;      // the practice topic its link opens
  agent?: boolean;  // the only step that runs without a person
  recs: string[];   // recommendation ids, shown under the step
}

export const STEPS: Step[] = [
  { name: 'Plan', l1: 'human intent,', l2: 'a checkable goal', topic: 'prompting',
    recs: ['write-context-files-by-hand-and-keep-them-short', 'keep-context-lean'] },
  { name: 'Tests', l1: 'human-owned,', l2: 'they are the spec', topic: 'testing',
    recs: ['keep-a-human-upstream-of-what-tests-assert', 'work-in-short-steady-test-and-code-cycles'] },
  { name: 'Agent loop', l1: 'small steps,', l2: 'capped retries', topic: 'looping', agent: true,
    recs: ['loop-only-against-a-check-the-machine-runs', 'stop-after-about-3-failed-fixes-then-reset-or-escalate'] },
  { name: 'Review', l1: 'an accountable', l2: 'human owner', topic: 'reviewing',
    recs: ['keep-an-accountable-human-review-on-ai-changes'] },
  { name: 'Ship', l1: 'small batches,', l2: 'rollback ready', topic: 'xp-agile',
    recs: ['work-in-small-batches-with-strong-version-control', 'enforce-standards-with-checks-not-documents'] },
];
