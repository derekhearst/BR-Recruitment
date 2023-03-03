import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import type { Appointment, locationData } from '$lib/types'
import dayJs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'

dayJs.extend(weekday)
export const load: PageServerLoad = async ({ fetch, locals, url, params }) => {
	const session = await locals.getSession()
	if (!session) {
		throw redirect(303, '/auth/signin?error=SessionRequired')
	}

	let searchDate = new Date()
	if (url.searchParams.get('date')) {
		searchDate = new Date(url.searchParams.get('date') ?? '')
	}

	const dates: Date[] = []
	for (let i = 0; i < 7; i++) {
		dates.push(dayJs(searchDate).weekday(i).toDate())
	}

	const appointmentsRes = await fetch(
		`https://brrecruitment.azurewebsites.net/locations/${params.locationId}/appointments/${searchDate.toISOString().substring(0, 10)}`,
		{
			headers: {
				Authorization: `Bearer ${session.accessToken}`
			}
		}
	)

	if (!appointmentsRes.ok) {
		if (appointmentsRes.status === 401) {
			throw redirect(303, '/auth/signin?error=SessionRequired')
		}
		throw error(500, 'Failed to fetch calendar data : ' + appointmentsRes.statusText)
	}
	const appointments: Appointment[] = await appointmentsRes.json()

	appointments.sort((a, b) => {
		return new Date(a.start).getTime() - new Date(b.start).getTime()
	})
	const locationsRes = await fetch(`https://brrecruitment.azurewebsites.net/locations/`, {
		headers: {
			Authorization: `Bearer ${session.accessToken}`
		}
	})

	if (!locationsRes.ok) {
		if (locationsRes.status === 401) {
			throw redirect(303, '/auth/signin?error=SessionRequired')
		}
		throw error(500, 'Failed to fetch location data : ' + locationsRes.statusText)
	}
	const locations: [locationData] = await locationsRes.json()

	return {
		appointments,
		locationData: locations,
		dates
	}
}
