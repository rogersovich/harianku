/**
 * Date utility helpers for HarianKu (Default timezone WIB / UTC+7)
 */

export function getWIBDate(dateInput: Date = new Date()): Date {
  // Convert standard date to UTC+7 timezone Date object
  const utc = dateInput.getTime() + dateInput.getTimezoneOffset() * 60000
  return new Date(utc + 3600000 * 7)
}

export function getWIBDateString(date: Date = new Date()): string {
  const wib = getWIBDate(date)
  const yyyy = wib.getFullYear()
  const mm = String(wib.getMonth() + 1).padStart(2, '0')
  const dd = String(wib.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getWeekStartAndEnd(dateInput: Date = new Date()) {
  const wib = getWIBDate(dateInput)
  const day = wib.getDay()
  // Adjust so Monday is 1, Sunday is 7 (in JS, Sunday is 0, Monday is 1... Saturday is 6)
  const diffToMonday = day === 0 ? -6 : 1 - day
  
  const monday = new Date(wib)
  monday.setDate(wib.getDate() + diffToMonday)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  
  return {
    start: getWIBDateString(monday),
    end: getWIBDateString(sunday),
    mondayObject: monday
  }
}

export function getDayOfWeekWIB(dateInput: Date = new Date()): number {
  const wib = getWIBDate(dateInput)
  const day = wib.getDay() // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  return day === 0 ? 7 : day
}

export function formatIndonesianDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
