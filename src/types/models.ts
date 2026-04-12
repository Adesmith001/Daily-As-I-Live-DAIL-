import type { Timestamp } from 'firebase/firestore'

export type TrackerType = 'checkbox' | 'range'
export type ExerciseWeekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type ExerciseCategory =
  | 'warmup'
  | 'workout'
  | 'cardio'
  | 'core'
  | 'mobility'
  | 'recovery'
  | 'full-body'

export type AppTheme =
  | 'Mist'
  | 'Sage'
  | 'Sky'
  | 'Peach'
  | 'Lilac'
  | 'Rose'
  | 'Sand'
  | 'Slate'

export interface UserDocument {
  uid: string
  displayName: string
  email: string
  theme: AppTheme
  createdAt?: Timestamp | null
}

export interface TrackerDocument {
  id: string
  userId: string
  name: string
  sectionId?: string | null
  type: TrackerType
  description: string
  isActive: boolean
  displayOrder: number
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface TrackerSectionDocument {
  id: string
  userId: string
  name: string
  displayOrder: number
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface DailyEntryDocument {
  id: string
  userId: string
  trackerId: string
  entryDate: string
  checkboxValue: boolean | null
  rangeValue: number | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface TrackerFormValues {
  name: string
  sectionId: string
  type: TrackerType
  description: string
  isActive: boolean
}

export interface DailySummary {
  date: string
  score: number | null
  entryCount: number
  completedTrackers: number
  trackerCount: number
}

export interface WeeklySummary {
  averageScore: number | null
  bestScore: number | null
  daysLogged: number
  completionRate: number
}

export interface ExerciseWorkoutDocument {
  id: string
  userId: string
  templateItemId?: string | null
  name: string
  weekday: ExerciseWeekday
  weekdayOrder: number
  category: ExerciseCategory
  description: string
  target: string
  videoUrl: string
  videoSearchQuery: string
  isActive: boolean
  displayOrder: number
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface ExerciseWorkoutFormValues {
  name: string
  weekday: ExerciseWeekday
  category: ExerciseCategory
  description: string
  target: string
  videoUrl: string
  videoSearchQuery: string
  isActive: boolean
}

export interface ExerciseEntryDocument {
  id: string
  userId: string
  workoutId: string
  entryDate: string
  isCompleted: boolean
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface ExerciseProfileDocument {
  id: string
  userId: string
  xpTotal: number
  currentStreak: number
  bestStreak: number
  weeklyAdherence: number
  badges: string[]
  defaultTemplateVersionImported: string | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface ExerciseTemplateItem {
  templateItemId: string
  weekday: ExerciseWeekday
  category: ExerciseCategory
  name: string
  description: string
  target: string
  videoUrl: string
  videoSearchQuery: string
  displayOrder: number
}

export interface ExerciseTemplate {
  version: string
  title: string
  description: string
  items: ExerciseTemplateItem[]
}
