// The five-step workflow drawn in the Overview's loop diagram.
export interface Step {
  name: string; l1: string; l2: string;
  topic: string;      // the practice topic its link opens
  agent?: boolean;  // the only step that runs without a person
}

export const STEPS: Step[] = [
  { name: 'Plan', l1: 'human intent,', l2: 'a checkable goal', topic: 'specification' },
  { name: 'Tests', l1: 'human-owned,', l2: 'they are the spec', topic: 'testing' },
  { name: 'Agent loop', l1: 'small steps,', l2: 'capped retries', topic: 'looping', agent: true },
  { name: 'Review', l1: 'an accountable', l2: 'human owner', topic: 'reviewing' },
  { name: 'Ship', l1: 'small batches,', l2: 'rollback ready', topic: 'delivery' },
];
