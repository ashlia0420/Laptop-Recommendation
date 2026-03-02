// ============================================================
// js/questions.js — Question Definitions (config only)
// ============================================================
// No DOM. No logic. No imports.
//
// field names in soft questions must exactly match the keys
// that decision_engine.py expects in soft_preferences.
// ============================================================

export const QUESTIONS = [

  // ── Hard Constraints ────────────────────────────────────

  {
    id:          'budget',
    type:        'hard',
    inputType:   'number',
    label:       'What is your maximum budget?',
    hint:        'Enter the highest price you are willing to pay.',
    placeholder: 'e.g. 80000',
    unit:        '₹',
    min:         1000,
    max:         500000,
    required:    true,
  },

  {
    id:        'os',
    type:      'hard',
    inputType: 'select',
    label:     'Do you have a preferred operating system?',
    hint:      'Select "No preference" to include all operating systems.',
    options: [
      { value: 'any',     label: 'No preference' },
      { value: 'Windows', label: 'Windows'        },
      { value: 'DOS',   label: 'DOS'          },
      { value: 'Ubuntu',  label: 'Ubuntu'      },
    ],
    required: false,
  },

  {
    id:        'min_ram',
    type:      'hard',
    inputType: 'select',
    label:     'What is the minimum RAM you need?',
    hint:      'Laptops with less RAM than this will be excluded.',
    options: [
      { value: 4,  label: '4 GB'       },
      { value: 8,  label: '8 GB'       },
      { value: 16, label: '16 GB'      },
      { value: 32, label: '32 GB'      },
    ],
    required: false,
  },

  {
    id:        'min_storage',
    type:      'hard',
    inputType: 'select',
    label:     'What is the minimum total storage you need?',
    hint:      'Combined SSD and HDD. Laptops below this are excluded.',
    options: [
      { value: 0,    label: 'No minimum'      },
      { value: 128,  label: '128 GB'          },
      { value: 256,  label: '256 GB'          },
      { value: 512,  label: '512 GB'          },
      { value: 1024, label: '1 TB (1024 GB)'  },
    ],
    required: false,
  },

  // ── Soft Preferences ────────────────────────────────────
  // field must exactly match decision_engine.py FIELD_LABELS keys

  {
    id:        'weight_performance',
    type:      'soft',
    field:     'cpu_performance',
    inputType: 'importance',
    label:     'How important is processing performance?',
    hint:      'Scored from CPU core and thread count. Higher = more powerful.',
  },

  {
    id:        'weight_ram',
    type:      'soft',
    field:     'ram(GB)',
    inputType: 'importance',
    label:     'How important is having a lot of RAM?',
    hint:      'More RAM helps with multitasking and demanding applications.',
  },

  {
    id:        'weight_storage',
    type:      'soft',
    field:     'total_storage_GB',
    inputType: 'importance',
    label:     'How important is total storage capacity?',
    hint:      'Combined SSD and HDD. Relevant if you store large files locally.',
  },

  {
    id:        'weight_ssd',
    type:      'soft',
    field:     'ssd(GB)',
    inputType: 'importance',
    label:     'How important is fast SSD storage specifically?',
    hint:      'SSD is far faster than HDD — affects boot speed and responsiveness.',
  },

  {
    id:        'weight_display',
    type:      'soft',
    field:     'screen_size(inches)',
    inputType: 'importance',
    label:     'How important is display size?',
    hint:      'Larger screens suit productivity; smaller ones suit portability.',
  },

];

// Importance level → numeric weight sent in the API payload
export const IMPORTANCE_MAP = {
  High:   3,
  Medium: 2,
  Low:    1,
};
