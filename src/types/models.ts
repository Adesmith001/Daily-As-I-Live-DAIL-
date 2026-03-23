import type { Timestamp } from 'firebase/firestore'

export type TrackerType = 'checkbox' | 'range'

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
