import { Appointment } from '@/types';

/**
 * Eksportuje spotkanie do formatu .ics (iCalendar)
 * Umożliwia dodanie do Google Calendar, Outlook, Apple Calendar
 */
export function exportToICS(appointment: Appointment, clientName?: string): void {
  const startDate = new Date(`${appointment.date}T${appointment.time}`);
  const endDate = new Date(startDate.getTime() + appointment.duration * 60000);
  
  // Format daty dla .ics: YYYYMMDDTHHmmss
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MESSU BOUW//Appointment Calendar//NL
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${appointment.id}@messubouw.nl
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${appointment.title}
DESCRIPTION:${appointment.description || 'Spotkanie z ' + (clientName || 'klientem')}
LOCATION:${appointment.location || 'Do ustalenia'}
STATUS:${appointment.status === 'scheduled' ? 'CONFIRMED' : appointment.status === 'cancelled' ? 'CANCELLED' : 'TENTATIVE'}
CATEGORIES:${appointment.category || 'MEETING'}
PRIORITY:5
BEGIN:VALARM
TRIGGER:-PT${appointment.reminder_minutes}M
ACTION:DISPLAY
DESCRIPTION:Przypomnienie o spotkaniu
END:VALARM
END:VEVENT
END:VCALENDAR`;

  // Utwórz plik i pobierz
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `spotkanie-${appointment.date}-${appointment.time.replace(':', '')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Generuje powtarzające się spotkania na podstawie ustawień recurring
 */
export function generateRecurringAppointments(
  baseAppointment: Appointment,
  maxOccurrences: number = 52
): Omit<Appointment, 'id' | 'created_at' | 'updated_at'>[] {
  if (!baseAppointment.recurring?.enabled) return [];

  const appointments: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>[] = [];
  const startDate = new Date(baseAppointment.date);
  const { frequency, interval = 1, end_date, occurrences } = baseAppointment.recurring;
  
  const maxCount = occurrences || maxOccurrences;
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < maxCount; i++) {
    // Dodaj interwał w zależności od częstotliwości
    if (i > 0) {
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * interval));
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
      }
    }
    
    // Sprawdź czy nie przekroczyliśmy end_date
    if (end_date && currentDate > new Date(end_date)) break;
    
    const newAppointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'> = {
      ...baseAppointment,
      date: currentDate.toISOString().split('T')[0],
      recurring: {
        ...baseAppointment.recurring,
        parent_id: baseAppointment.id,
      },
    };
    
    appointments.push(newAppointment);
  }
  
  return appointments;
}

/**
 * Zwraca kolor dla kategorii spotkania
 */
export function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    consultation: '#3B82F6', // Niebieski
    meeting: '#10B981',       // Zielony
    inspection: '#F59E0B',    // Pomarańczowy
    estimate: '#8B5CF6',      // Fioletowy
    other: '#6B7280',         // Szary
  };
  
  return category ? colors[category] || '#6B7280' : '#6B7280';
}

/**
 * Zwraca nazwę kategorii po polsku
 */
export function getCategoryLabel(category?: string): string {
  const labels: Record<string, string> = {
    consultation: 'Konsultacja',
    meeting: 'Spotkanie',
    inspection: 'Kontrola',
    estimate: 'Wycena',
    other: 'Inne',
  };
  
  return category ? labels[category] || 'Inne' : 'Inne';
}

/**
 * Generuje link do Google Maps dla lokalizacji
 */
export function getGoogleMapsLink(location?: string): string {
  if (!location) return '';
  const encoded = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

/**
 * Oblicza kolizje między spotkaniami
 */
export function checkAppointmentConflict(
  appointment: Appointment,
  existingAppointments: Appointment[]
): Appointment | null {
  const newStart = new Date(`${appointment.date}T${appointment.time}`);
  const newEnd = new Date(newStart.getTime() + appointment.duration * 60000);
  
  for (const existing of existingAppointments) {
    if (existing.id === appointment.id) continue;
    if (existing.status === 'cancelled') continue;
    
    const existingStart = new Date(`${existing.date}T${existing.time}`);
    const existingEnd = new Date(existingStart.getTime() + existing.duration * 60000);
    
    // Sprawdź nakładanie się
    if (newStart < existingEnd && newEnd > existingStart) {
      return existing;
    }
  }
  
  return null;
}

/**
 * Formatuje czas trwania spotkania
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Generuje sugestie wolnych terminów
 */
export function suggestFreeSlots(
  date: string,
  existingAppointments: Appointment[],
  duration: number = 60,
  workHoursStart: number = 9,
  workHoursEnd: number = 17
): string[] {
  const slots: string[] = [];
  const dayAppointments = existingAppointments.filter(
    a => a.date === date && a.status !== 'cancelled'
  );
  
  // Generuj sloty co 30 minut
  for (let hour = workHoursStart; hour < workHoursEnd; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotStart = new Date(`${date}T${timeStr}`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      
      // Sprawdź czy slot jest wolny
      let isFree = true;
      for (const apt of dayAppointments) {
        const aptStart = new Date(`${apt.date}T${apt.time}`);
        const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
        
        if (slotStart < aptEnd && slotEnd > aptStart) {
          isFree = false;
          break;
        }
      }
      
      if (isFree && slotEnd.getHours() <= workHoursEnd) {
        slots.push(timeStr);
      }
    }
  }
  
  return slots;
}
