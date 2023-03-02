import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import type { Appointment } from '$lib/types'

export const load: PageServerLoad = async ({ fetch, locals, url, params }) => {
	const session = await locals.getSession()
	if (!session) {
		throw redirect(303, '/auth/signin?error=SessionRequired')
	}

	let searchDate = new Date('3/5/2023')
	if (url.searchParams.get('date')) {
		searchDate = new Date(url.searchParams.get('date') ?? '')
	}

	const appointmentsRes = await fetch(
		`https://brrecruitment.azurewebsites.net/locations/${params.locationId}/appointments/${searchDate.toISOString().substring(0, 10)}`,
		{
			headers: {
				Authorization: `Bearer ${session.accessToken}`
			}
		}
	)

	const locationsRes = await fetch(`https://brrecruitment.azurewebsites.net/locations/`, {
		headers: {
			Authorization: `Bearer ${session.accessToken}`
		}
	})

	if (!locationsRes.ok) {
		throw error(500, 'Failed to fetch location data : ' + locationsRes.statusText)
	}

	if (!appointmentsRes.ok) {
		throw error(500, 'Failed to fetch calendar data : ' + appointmentsRes.statusText)
	}

	const appointments: Appointment[] = await appointmentsRes.json()
	const locations: [
		{
			id: number
			name: string
			avaliableSlots: number
			isHardCap: boolean
		}
	] = await locationsRes.json()

	appointments.sort((a, b) => {
		return new Date(a.start).getTime() - new Date(b.start).getTime()
	})

	// maps appointments to a new map with the key as the date and the value as a map of the time and the appointment
	const mappedAppointments = new Map<string, Map<string, Map<string, Appointment>>>()

	appointments.forEach((appointment) => {
		const fullTime = new Date(appointment.start)
		console.log(fullTime)
		const date = fullTime.toLocaleDateString()
		const time = fullTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		if (!mappedAppointments.has(date)) {
			mappedAppointments.set(date, new Map())
		}
		if (!mappedAppointments.get(date)?.has(time)) {
			mappedAppointments.get(date)?.set(time, new Map())
		}
		mappedAppointments.get(date)?.get(time)?.set(appointment.id.toString(), appointment)
	})

	const allowedTimeSlots = [
		'07:00 AM',
		'07:30 AM',
		'08:00 AM',
		'08:30 AM',
		'09:00 AM',
		'09:30 AM',
		'10:00 AM',
		'10:30 AM',
		'11:00 AM',
		'11:30 AM',
		'12:00 PM',
		'12:30 PM',
		'1:00 PM',
		'1:30 PM',
		'2:00 PM',
		'2:30 PM'
	]

	return {
		appointments,
		mappedAppointments,
		locationName: locations.find((location) => location.id === parseInt(params.locationId))?.name ?? 'Unknown',
		allowedTimeSlots,
		allowedLocations: locations
	}
}
